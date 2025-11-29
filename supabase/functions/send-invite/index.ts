import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Polyfill Deno.writeAll (removed in newer Deno versions)
if (typeof Deno.writeAll === "undefined") {
  // @ts-ignore
  Deno.writeAll = async (writer: any, data: Uint8Array) => {
    let n = 0;
    while (n < data.length) {
      const nwritten = await writer.write(data.subarray(n));
      n += nwritten;
    }
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { tripId, email, role } = await req.json();
    console.log("Request received:", { tripId, email, role });

    // 0. Check Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    console.log("Auth User:", user?.id, "Error:", authError);

    if (authError || !user) {
      throw new Error("User not authenticated in Edge Function");
    }

    // 1. Get Trip Details
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("title")
      .eq("id", tripId)
      .single();

    console.log("Trip Details:", trip, "Error:", tripError);

    if (tripError) throw tripError;

    // 2. Create Invite Record (Always)
    const { data: invite, error: inviteError } = await supabase
      .from("trip_invites")
      .insert({
        trip_id: tripId,
        email,
        role,
        created_by: user.id,
      })
      .select("token")
      .single();

    console.log("Invite Created:", invite, "Error:", inviteError);

    if (inviteError) throw inviteError;

    // 3. Send Email via Gmail SMTP (Deno Native)
    const inviteLink = `${req.headers.get("origin")}/join/${invite.token}`;
    console.log("Sending email to:", email, "Link:", inviteLink);

    const client = new SmtpClient();

    try {
      await client.connectTLS({
        hostname: "smtp.gmail.com",
        port: 465,
        username: Deno.env.get("SMTP_USER"),
        password: Deno.env.get("SMTP_PASS"),
      });

      await client.send({
        from: `Wanderlust Planner <${Deno.env.get("SMTP_USER")}>`,
        to: email,
        subject: `Invitation to join ${trip.title}`,
        content: `You have been invited to join the trip ${trip.title}. Join here: ${inviteLink}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>You've been invited!</h1>
            <p>You have been invited to join the trip <strong>${trip.title}</strong> on Wanderlust.</p>
            <p>Click the button below to accept the invitation:</p>
            <a href="${inviteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Trip</a>
            <p>Or copy this link:</p>
            <p><a href="${inviteLink}">${inviteLink}</a></p>
          </div>
        `,
      });

      await client.close();
      console.log("Email sent successfully via Gmail (Deno SMTP)");
    } catch (emailError: any) {
      console.error("Gmail SMTP Error:", emailError);
      // Fallback: Return link if email fails
      return new Response(
        JSON.stringify({
          message: "Invite created (Email failed)",
          inviteLink: inviteLink,
          warning: emailError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Invitation sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
