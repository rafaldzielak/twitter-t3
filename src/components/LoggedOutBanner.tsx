import { signIn, useSession } from "next-auth/react";
import React from "react";
import Container from "./Container";

const LoggedOutBanner = () => {
  const { data: session } = useSession();

  if (session) return null;
  return (
    <div className="fixed bottom-0 w-full bg-primary p-4">
      <Container classNames="bg-transparent flex justify-between">
        <p className="text-white">Do not miss out</p>
        <div>
          <button onClick={() => void signIn()} className="px-4 py-2 text-white shadow-md">
            Login
          </button>
        </div>
      </Container>
    </div>
  );
};

export default LoggedOutBanner;
