import { LinkButton } from "../components/index.js";

/**
 * Public landing at `/`.
 *
 * Renders for everyone — anonymous and authenticated visitors alike, with
 * no redirect. Header with the LocalGym logo and an "Iniciar sesión" link,
 * an informational section, and a footer with reserved-rights text plus an
 * offline-operation note.
 */
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-base text-paper">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <p className="font-display text-display-md font-semibold tracking-tight">LocalGym</p>
        <LinkButton to="/login">
          Iniciar sesión
        </LinkButton>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12">
        <h1 className="font-display text-display-xl font-semibold tracking-tight">
          Gestión simple para tu gimnasio
        </h1>
        <p className="mt-4 text-body-lg text-fog">
          LocalGym es un sistema gratuito de gestión para gimnasios pequeños y medianos:
          registra socios, controla membresías y lleva los pagos al día, todo en un solo
          lugar.
        </p>
        <p className="mt-2 text-body-lg text-fog">
          Tus datos viven en tu propio equipo y el sistema sigue funcionando aunque se
          caiga internet.
        </p>
      </main>
      <footer className="border-t border-line bg-surface px-6 py-4 text-center">
        <p className="text-body-sm text-fog">
          © LocalGym. Todos los derechos reservados.
        </p>
        <p className="mt-1 text-body-sm text-fog">
          Funciona sin conexión: tus datos están disponibles aunque no tengas internet.
        </p>
      </footer>
    </div>
  );
}
