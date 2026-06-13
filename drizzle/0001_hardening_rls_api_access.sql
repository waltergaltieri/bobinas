-- Custom SQL migration file, put your code below! --
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_images enable row level security;
alter table public.attributes enable row level security;
alter table public.attribute_options enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security;
alter table public.home_slides enable row level security;
alter table public.popup_settings enable row level security;
alter table public.product_views enable row level security;
alter table public.search_logs enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_categories from anon, authenticated;
revoke all on table public.product_images from anon, authenticated;
revoke all on table public.attributes from anon, authenticated;
revoke all on table public.attribute_options from anon, authenticated;
revoke all on table public.product_attribute_values from anon, authenticated;
revoke all on table public.purchase_requests from anon, authenticated;
revoke all on table public.purchase_request_items from anon, authenticated;
revoke all on table public.home_slides from anon, authenticated;
revoke all on table public.popup_settings from anon, authenticated;
revoke all on table public.product_views from anon, authenticated;
revoke all on table public.search_logs from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
