import { SignUp, Waitlist } from "@clerk/nextjs";

const signupsDisabled = process.env.SIGNUPS_DISABLED === "true";

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center py-12">
      {signupsDisabled ? <Waitlist /> : <SignUp />}
    </div>
  );
}
