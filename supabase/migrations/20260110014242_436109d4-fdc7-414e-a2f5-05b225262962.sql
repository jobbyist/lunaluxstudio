-- Create function to check and award birthday bonus
CREATE OR REPLACE FUNCTION public.check_and_award_birthday_bonus()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  current_year INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Find users who have their birthday today and haven't received bonus this year
  FOR user_record IN 
    SELECT up.user_id, up.full_name, up.birthday
    FROM user_profiles up
    WHERE up.birthday IS NOT NULL
      AND EXTRACT(MONTH FROM up.birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM up.birthday) = EXTRACT(DAY FROM CURRENT_DATE)
      AND NOT EXISTS (
        SELECT 1 FROM loyalty_transactions lt
        WHERE lt.user_id = up.user_id
          AND lt.transaction_type = 'birthday_bonus'
          AND EXTRACT(YEAR FROM lt.created_at) = current_year
      )
  LOOP
    -- Award 100 birthday bonus points
    INSERT INTO loyalty_transactions (user_id, points, transaction_type, description)
    VALUES (user_record.user_id, 100, 'birthday_bonus', 'Happy Birthday! 🎂 Enjoy your birthday bonus points!');
    
    -- Update user's loyalty points
    UPDATE user_profiles
    SET loyalty_points = loyalty_points + 100,
        updated_at = NOW()
    WHERE user_id = user_record.user_id;
  END LOOP;
END;
$$;

-- Create a helper function that can be called to award birthday bonus for a specific user
CREATE OR REPLACE FUNCTION public.award_birthday_bonus_if_eligible(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_birthday DATE;
  current_year INTEGER;
  already_awarded BOOLEAN;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get user's birthday
  SELECT birthday INTO user_birthday
  FROM user_profiles
  WHERE user_id = target_user_id;
  
  -- Check if birthday is today
  IF user_birthday IS NULL OR 
     EXTRACT(MONTH FROM user_birthday) != EXTRACT(MONTH FROM CURRENT_DATE) OR
     EXTRACT(DAY FROM user_birthday) != EXTRACT(DAY FROM CURRENT_DATE) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already awarded this year
  SELECT EXISTS (
    SELECT 1 FROM loyalty_transactions
    WHERE user_id = target_user_id
      AND transaction_type = 'birthday_bonus'
      AND EXTRACT(YEAR FROM created_at) = current_year
  ) INTO already_awarded;
  
  IF already_awarded THEN
    RETURN FALSE;
  END IF;
  
  -- Award the bonus
  INSERT INTO loyalty_transactions (user_id, points, transaction_type, description)
  VALUES (target_user_id, 100, 'birthday_bonus', 'Happy Birthday! 🎂 Enjoy your birthday bonus points!');
  
  UPDATE user_profiles
  SET loyalty_points = loyalty_points + 100,
      updated_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;