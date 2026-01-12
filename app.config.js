import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    eas: {
      projectId: "2cbbf4b0-50d8-4f50-bbed-d5b6b47ee10b"
    },
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
