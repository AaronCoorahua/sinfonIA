"use client";

import {
  Authenticator,
  ThemeProvider,
  View,
  Heading,
  Text,
  Image,
  Button,
  useTheme,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import { I18n } from "aws-amplify/utils";
import { translations } from "@aws-amplify/ui-react";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../../components/ui/sidebar";

I18n.putVocabularies(translations);
I18n.setLanguage("es");
I18n.putVocabularies({
  es: {
    "Sign In": "Iniciar sesión",
    "Sign Up": "Crear cuenta",
    "Forgot your password?": "¿Olvidaste tu contraseña?",
    "Reset your password": "Restablecer tu contraseña",
    "Confirm Sign Up": "Confirmar registro",
    "Confirm Sign In": "Confirmar inicio de sesión",
    "Back to Sign In": "Volver a iniciar sesión",
    Username: "Usuario",
    "Enter your username": "Ingresa tu usuario",
    "Enter your Username": "Ingresa tu usuario",
    Password: "Contraseña",
    "Enter your password": "Ingresa tu contraseña",
    "Enter your Password": "Ingresa tu contraseña",
    "Confirm Password": "Confirmar contraseña",
    "Please confirm your Password": "Confirma tu contraseña",
    Email: "Correo electrónico",
    "Enter your email": "Ingresa tu correo",
    "Enter your Email": "Ingresa tu correo",
    "Confirmation Code": "Código de confirmación",
    "Enter your Confirmation Code:": "Ingresa tu código de confirmación",
    "Send code": "Enviar código",
    Submit: "Enviar",
    "Resend Code": "Reenviar código",
    "Reset Password": "Restablecer contraseña",
    "Change Password": "Cambiar contraseña",
    "Your code is on the way. To log in, enter the code we emailed to":
      "Hemos enviado un código a tu correo. Para iniciar sesión, ingrésalo en",
    "Your code is on the way. To log in, enter the code we texted to":
      "Hemos enviado un código a tu teléfono. Para iniciar sesión, ingrésalo en",
    "Your code is on the way. To log in, enter the code we sent you. It may take a minute to arrive.":
      "Tu código va en camino. Para iniciar sesión, ingrésalo a continuación. Puede tardar un minuto.",
    "It may take a minute to arrive.": "Puede tardar un minuto en llegar.",
  },
});

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <div className="flex items-center justify-center gap-0">
          <Image
            alt="SinfonIA logo"
            src="/logo.png"
            width="12"
            height="12"
            className="shrink-0"
          />
        </div>
      </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();
    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Button as="a" href="/" variation="link" size="small">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </span>
        </Button>
      </View>
    );
  },

  SignIn: {
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button variation="link" size="small" onClick={toForgotPassword}>
            Restablecer contraseña
          </Button>
        </View>
      );
    },
  },

  ConfirmSignUp: {},

  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
          level={3}
        >
          Restablecer contraseña
        </Heading>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Ingresa tu correo",
      label: "Correo",
      isRequired: true,
    },
    password: {
      placeholder: "Ingresa tu contraseña",
      label: "Contraseña",
      isRequired: true,
    },
  },
  signUp: {
    email: { order: 1, label: "Correo", placeholder: "Ingresa tu correo" },
    name: {
      order: 2,
      label: "Nombre completo",
      placeholder: "Ingresa tu nombre",
      isRequired: true,
    },
    phone_number: {
      order: 3,
      label: "Número de teléfono",
      placeholder: "--- --- ---",
      dialCode: "+51",
      dialCodeList: ["+51"],
      isRequired: true,
    },
    password: {
      order: 4,
      label: "Contraseña",
      placeholder: "Crea una contraseña",
    },
    confirm_password: {
      order: 5,
      label: "Confirmar contraseña",
      placeholder: "Repite tu contraseña",
    },
  },
  forgotPassword: {
    username: {
      label: "Correo",
      placeholder: "Ingresa tu correo",
      isRequired: true,
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      label: "Código de confirmación",
      placeholder: "Ingresa el código",
    },
    password: {
      label: "Nueva contraseña",
      placeholder: "Crea una nueva contraseña",
    },
    confirm_password: {
      label: "Confirmar contraseña",
      placeholder: "Repite tu nueva contraseña",
    },
  },
};

export default function PrivateLayout({ children }) {
  const themeMin = {
    name: "sinfonia-dark-min",
    tokens: {
      colors: {
        background: { primary: { value: "#0b0f1a" } },
        font: { primary: { value: "#ffffff" } },
      },
    },
  };

  return (
    <div data-amplify-color-mode="dark">
      <ThemeProvider theme={themeMin} colorMode="dark">
        <Authenticator
          components={components}
          formFields={formFields}
          signUpAttributes={["email", "phone_number", "name"]}
          hideSignUp
        >
          {({ signOut, user }) => (
            <div className="min-h-screen flex flex-col md:flex-row">
              <Sidebar />

              <main className="flex-1 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] p-6">
                {children}
              </main>
            </div>
          )}
        </Authenticator>
      </ThemeProvider>
    </div>
  );
}
