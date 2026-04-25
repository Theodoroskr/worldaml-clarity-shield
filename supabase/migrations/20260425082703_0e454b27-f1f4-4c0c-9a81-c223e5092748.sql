CREATE TRIGGER suite_transactions_flagged_workflow
AFTER INSERT OR UPDATE OF risk_flag ON public.suite_transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_transaction_flagged();

CREATE TRIGGER suite_customers_new_workflow
AFTER INSERT ON public.suite_customers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_new_customer();

CREATE TRIGGER suite_customers_risk_change_workflow
AFTER UPDATE OF risk_level ON public.suite_customers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_risk_change();

CREATE TRIGGER suite_screenings_match_workflow
AFTER INSERT ON public.suite_screenings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_workflow_screening_match();