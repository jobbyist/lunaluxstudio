-- Create a function to send welcome email via pg_net
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  supabase_url TEXT;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.user_id;
  
  -- Get the user's name from the profile
  user_name := NEW.full_name;
  
  -- Get the Supabase URL from environment (we'll use a fixed URL for the edge function)
  supabase_url := 'https://iyerckzoapcyrxbssnyv.supabase.co/functions/v1/send-welcome-email';
  
  -- Call the edge function using pg_net
  PERFORM net.http_post(
    url := supabase_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'email', user_email,
      'name', user_name
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the transaction
  RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to send welcome email when a new profile is created
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.user_profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();