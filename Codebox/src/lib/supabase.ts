import asyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_KEY as string, 
    {
        auth: {
            storage: asyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            flowType: "pkce",
        },
    }
) 