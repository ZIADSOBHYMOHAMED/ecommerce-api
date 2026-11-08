CREATE OR REPLACE FUNCTION create_user_cart()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO carts (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;


CREATE OR REPLACE TRIGGER trigger_create_user_cart
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_cart();

