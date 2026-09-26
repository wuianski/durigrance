"use client";

export default function ResetButton({
  action,
  userNumber,
}: {
  action: (formData: FormData) => Promise<void>;
  userNumber: string;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      className="btn-danger"
      onClick={(event) => {
        if (
          !confirm(
            `Reset user ${userNumber}? Their name and email will be cleared and they can register again from their QR code.`
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      Reset
    </button>
  );
}
