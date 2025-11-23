import { Stack, TextField, MenuItem } from "@mui/material";
import todayDate from "../../../../utils/todayDate";
import { CURRENCIES } from "../../../../utils/currency";

interface DateBudgetSectionProps {
  startDate: string;
  endDate: string;
  budget: string | number;
  currency: string;
  onChange: (field: string, value: any) => void;
}

export const DateBudgetSection = ({
  startDate,
  endDate,
  budget,
  currency,
  onChange,
}: DateBudgetSectionProps) => {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          required
          fullWidth
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          inputProps={{ min: todayDate }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          required
          fullWidth
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => onChange("endDate", e.target.value)}
          inputProps={{ min: startDate }}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          type="number"
          label="Budget (Optional)"
          placeholder="0"
          value={budget}
          onChange={(e) => onChange("budget", e.target.value)}
          InputProps={{
            inputProps: {
              min: 0,
            },
          }}
        />

        <TextField
          select
          required
          fullWidth
          label="Currency"
          value={currency}
          onChange={(e) => onChange("currency", e.target.value)}
        >
          {CURRENCIES.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.symbol} - {currency.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  );
};
