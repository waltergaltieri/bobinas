import { Mail, MapPin, MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Contacto</h1>
      <p className="mt-2 text-muted-foreground">
        Canal comercial para consultas de productos y pedidos.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: MessageCircle, title: "WhatsApp", text: "Configurable en admin" },
          { icon: Mail, title: "Email", text: "ventas@ejemplo.com" },
          { icon: MapPin, title: "Direccion", text: "Datos del negocio" },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <item.icon className="h-4 w-4" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.text}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
