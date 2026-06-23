import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  FileText,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const demoContact = {
  whatsapp: "+54 11 4567-8900",
  email: "ventas@bobinas.test",
  phone: "+54 11 4455-6677",
  address: "Av. Repuestos 1234, Buenos Aires",
  hours: "Lunes a viernes de 9 a 18 hs",
};

const whatsappHref =
  "https://wa.me/5491145678900?text=Hola%2C%20necesito%20identificar%20un%20repuesto.";

const contactChannels = [
  {
    icon: MessageCircle,
    label: "WhatsApp comercial",
    value: demoContact.whatsapp,
    detail: "Respuesta rapida para consultas con codigo, foto o aplicacion.",
  },
  {
    icon: Mail,
    label: "Email tecnico",
    value: demoContact.email,
    detail: "Ideal para enviar referencias, medidas y detalle de flota.",
  },
  {
    icon: Phone,
    label: "Telefono",
    value: demoContact.phone,
    detail: "Atencion directa para seguimiento de solicitudes.",
  },
  {
    icon: MapPin,
    label: "Direccion",
    value: demoContact.address,
    detail: "Punto de referencia comercial sujeto a coordinacion previa.",
  },
];

const requestHints = [
  {
    icon: FileText,
    title: "Codigo OEM o interno",
    text: "Cualquier referencia grabada en la pieza acelera la validacion.",
  },
  {
    icon: Wrench,
    title: "Marca, modelo o aplicacion",
    text: "Indicanos vehiculo, motor, alternador, arranque o sistema asociado.",
  },
  {
    icon: Camera,
    title: "Foto de la pieza",
    text: "Frente, laterales, ficha, dientes o encastre ayudan a comparar.",
  },
  {
    icon: Ruler,
    title: "Voltaje, estrias, medidas o cantidad de dientes",
    text: "Los datos tecnicos evitan cruces incorrectos y retrabajo.",
  },
];

const processSteps = [
  "Consulta recibida",
  "Validacion tecnica",
  "Respuesta comercial",
  "Solicitud de pedido",
];

export default function ContactPage() {
  return (
    <div className="bg-[#f7f3f2] text-[#1a1a1b]">
      <section className="blueprint-grid relative overflow-hidden border-b-8 border-[#b87333] bg-[#1a1a1b]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-24 top-10 h-96 w-96 border border-[#b87333]/40" />
          <div className="absolute bottom-10 right-28 h-48 w-48 border border-white/10" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1600px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24 xl:px-12">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="bg-[#b87333] px-3 py-1 font-mono text-xs font-black uppercase text-white">
                Contacto tecnico
              </span>
              <div className="h-px w-24 bg-[#b87333]/40" />
            </div>
            <h1 className="max-w-4xl text-[42px] font-black uppercase leading-none text-white sm:text-6xl lg:text-7xl">
              Hablemos de tu{" "}
              <span className="text-[#b87333]">repuesto</span>
            </h1>
            <p className="mt-8 max-w-2xl border-l-4 border-[#b87333] pl-6 text-base font-bold uppercase leading-relaxed text-white/75">
              Envianos el codigo, aplicacion o foto de la pieza y nuestro
              equipo te ayuda a identificar la opcion correcta.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={whatsappHref}
                className="group flex items-center gap-4 bg-white px-9 py-5 font-mono text-xs font-black uppercase text-[#1a1a1b] transition hover:bg-[#b87333] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Consultar por WhatsApp
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href={`mailto:${demoContact.email}`}
                className="flex items-center gap-4 border-2 border-white/30 px-9 py-5 font-mono text-xs font-black uppercase text-white transition hover:bg-white/10"
              >
                <Mail className="h-4 w-4" />
                Enviar email
              </Link>
            </div>
          </div>

          <div className="border-2 border-[#b87333] bg-[#242426]/80 p-6 shadow-[18px_18px_0_0_rgba(184,115,51,0.18)] lg:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <p className="font-mono text-xs font-black uppercase text-[#b87333]">
                Mesa comercial
              </p>
              <Clock className="h-5 w-5 text-[#b87333]" />
            </div>
            <div className="space-y-5">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;

                return (
                  <div
                    key={channel.label}
                    className="grid gap-3 border-b border-white/10 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[auto_1fr]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center bg-[#b87333] text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase text-white/35">
                        {channel.label}
                      </p>
                      <p className="mt-1 text-lg font-black uppercase text-white">
                        {channel.value}
                      </p>
                      <p className="mt-2 text-sm uppercase leading-relaxed text-white/55">
                        {channel.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 border border-white/10 bg-black/20 p-4 font-mono text-[11px] uppercase text-white/50">
              Horario de atencion:{" "}
              <span className="font-black text-[#b87333]">{demoContact.hours}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="blueprint-grid py-20 sm:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="border-l-8 border-[#b87333] pl-6">
              <h2 className="text-3xl font-black uppercase">
                Para responderte mejor
              </h2>
              <p className="mt-3 font-mono text-xs font-black uppercase text-[#b87333]">
                Datos que ayudan a identificar la pieza correcta
              </p>
            </div>
            <div className="border border-[#c7c6ca] bg-white px-4 py-2 font-mono text-[11px] uppercase text-[#1a1a1b]/45">
              Sin precios publicos // Revision manual
            </div>
          </div>

          <div className="grid border-2 border-[#1a1a1b] bg-white md:grid-cols-4 md:divide-x-2 md:divide-[#1a1a1b]">
            {requestHints.map((hint) => {
              const Icon = hint.icon;

              return (
                <div
                  key={hint.title}
                  className="border-b-2 border-[#1a1a1b] p-7 md:border-b-0 lg:p-9"
                >
                  <Icon className="mb-8 h-9 w-9 text-[#b87333]" />
                  <h3 className="text-lg font-black uppercase leading-tight">
                    {hint.title}
                  </h3>
                  <p className="mt-4 text-sm uppercase leading-relaxed text-[#46474a]">
                    {hint.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y-4 border-[#1a1a1b] bg-white py-20">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-black uppercase text-[#b87333]">
                Flujo de atencion
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase">
                De la consulta a la solicitud
              </h2>
              <p className="mt-5 max-w-xl text-sm uppercase leading-relaxed text-[#46474a]">
                Cada pedido se revisa antes de avanzar. Confirmamos
                compatibilidad, disponibilidad y condiciones comerciales por un
                canal directo.
              </p>
            </div>

            <div className="grid border-2 border-[#1a1a1b] md:grid-cols-4">
              {processSteps.map((step, index) => (
                <div
                  key={step}
                  className="relative border-b-2 border-[#1a1a1b] bg-[#f7f3f2] p-6 md:border-b-0 md:border-r-2 md:last:border-r-0"
                >
                  <span className="font-mono text-[10px] font-black uppercase text-[#b87333]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-8 min-h-12 text-lg font-black uppercase leading-tight">
                    {step}
                  </p>
                  <CheckCircle2 className="absolute bottom-5 right-5 h-5 w-5 text-[#b87333]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="blueprint-subgrid bg-[#1a1a1b] py-20 sm:py-24">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 xl:px-12">
          <div className="grid overflow-hidden border-4 border-[#b87333] bg-[#1a1a1b] md:grid-cols-[1fr_auto]">
            <div className="p-8 lg:p-12">
              <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#b87333] text-white">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="max-w-3xl text-3xl font-black uppercase text-white">
                ¿Ya trabajas con nosotros?
              </h2>
              <p className="mt-5 max-w-2xl text-sm uppercase leading-relaxed text-white/60">
                Ingresá al portal para consultar productos, revisar condiciones
                asignadas y gestionar tu lista de pedido.
              </p>
            </div>
            <div className="flex items-center border-t border-white/10 bg-[#242426] p-8 md:border-l md:border-t-0 lg:p-12">
              <Link
                href="/login"
                className="group flex items-center gap-5 bg-[#b87333] px-10 py-6 font-mono text-sm font-black uppercase text-white transition hover:bg-white hover:text-[#1a1a1b]"
              >
                <LockKeyhole className="h-5 w-5" />
                Acceso clientes
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#b87333] px-4 py-10 text-white sm:px-8 xl:px-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 font-mono text-xs font-black uppercase md:flex-row md:items-center md:justify-between">
          <span>Soporte tecnico directo</span>
          <span>Catalogo publico sin precios visibles</span>
          <span>Solicitudes revisadas por administracion</span>
        </div>
      </section>
    </div>
  );
}
