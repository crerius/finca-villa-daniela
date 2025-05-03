// app/auth/verify-request/page.tsx
export default function VerifyRequestPage() {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 border rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-semibold mb-4">Revisa tu Email</h1>
          <p>Se ha enviado un enlace (o código) de inicio de sesión a tu dirección de correo electrónico.</p>
          <p>Por favor, haz clic en el enlace para iniciar sesión.</p>
        </div>
      </div>
    );
  }