# Agent Rules

## Next.js 16

This project uses Next.js App Router on a modern Next version. Before changing
Next-specific routing, Server Actions, Route Handlers, Proxy, caching, cookies,
or environment handling, consult the relevant guide in `node_modules/next/dist/docs/`.

## Business Rules

- This is not a traditional ecommerce site.
- There is no checkout flow.
- There is no online payment flow.
- Do not use labels such as "checkout", "pagar", or "comprar ahora".
- Use "pedido", "solicitud de pedido", or "lista de pedido".
- Public visitors never see prices.
- BUYER users can see prices and create pedido requests.
- ADMIN users manage products, categories, attributes, buyers, pedido requests,
  home content, popup content, and metrics.
- Product images, category images, carousel images, and popup images are stored
  in Cloudinary. The database stores only URLs, public IDs, and metadata.
- Pedido records are requests, not automatic sales.
- A sale result is marked later by an ADMIN as concretada or no concretada.
- Product technical attributes must stay normalized so they can power filters.

## Security Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`,
  `DATABASE_URL`, or Cloudinary secrets to client code.
- Treat every `NEXT_PUBLIC_*` variable as browser-visible.
- Protected pages and mutations must verify authorization server-side.
- Do not rely on Proxy as the only authorization layer.
- Public catalog queries must not select or return `price`.
