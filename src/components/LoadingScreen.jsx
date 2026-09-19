/** Skeleton shown while the account and business load (design: Loading). */
export default function LoadingScreen() {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pt-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex flex-col gap-3.5 rounded-3xl bg-card p-[18px] shadow-card">
        <i className="lg-sk block h-[34px] w-3/5 rounded-full" />
        <i className="lg-sk block h-11 w-4/5 rounded-[14px]" />
        <i className="lg-sk block h-11 w-[70%] rounded-[14px]" />
        <i className="lg-sk block h-4 w-[45%] rounded-full" />
      </div>
      <i className="lg-sk block h-16 rounded-full" />
      <i className="lg-sk block h-6 w-[35%] rounded-full" />
      <i className="lg-sk block h-[72px] rounded-[20px]" />
      <i className="lg-sk block h-[72px] rounded-[20px]" />
    </div>
  );
}
