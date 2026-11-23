# Next.js template

This is a Next.js template with shadcn/ui.

## Testing ESP32 controls

1. Connect the ESP32 and the computer running the web app to the same Wi-Fi network.
2. Upload the sketch in [arduinocode.md](./arduinocode.md) and open the Arduino
   Serial Monitor to find the ESP32 IP address.
3. Add the Serial Monitor IP to `.env.local`, then run `npm run dev` and open
   `http://localhost:3000`:

   ```env
   NEXT_PUBLIC_ESP32_IP=192.168.1.123
   ```

4. Start a game. The physical buttons change lanes, and the speed in the game
   header follows the Hall sensor reading from the ESP32, formatted to match
   the Serial Monitor's two decimal places. It displays `0.00 km/h` until a
   reading is received.

The browser connects directly to the ESP32, so its `/buttons` response must
include the CORS headers in [arduinocode.md](./arduinocode.md).

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
