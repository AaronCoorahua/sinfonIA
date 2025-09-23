import React from "react";
import CompetitionForm from "../../../components/competition/competition-form";

export default function CompetePage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full flex items-center justify-center">
        <div className="mx-auto max-w-5xl">
          <CompetitionForm />
        </div>
      </div>
    </main>
  );
}
