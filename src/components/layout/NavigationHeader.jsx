import HeaderButton from "../HeaderButton";

export default function NavigationHeader() {
  return (
    <nav className="bg-background-color w-full min-h-[83px] flex justify-between items-center tracking-tighter sticky top-0">
      <div className="gap-x-1 mx-4">
        <img src="../../assets/back-icon.svg" className="hidden" />
        <h1 className="font-laundry font-bold text-primary-500 text-[28px]">
          오는길에
        </h1>
      </div>

      <div className="gap-x-1 mx-4 flex items-center flex-reverse">
        <HeaderButton />
      </div>
    </nav>
  );
}
