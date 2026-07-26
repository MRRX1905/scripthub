alter function public.admin_save_executor(text, text, text, text[], integer, text)
security invoker;

alter function public.admin_delete_executor(text)
security invoker;

alter function public.admin_save_category(text, text)
security invoker;

alter function public.admin_delete_category(text)
security invoker;
