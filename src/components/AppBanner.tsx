export default function AppBanner() {
  return (
    <div className="flex flex-row justify-between items-center py-2 px-4 pr-2 gap-3 w-full h-14 bg-[#27282B] rounded-[100px] shadow-[0px_4px_16px_rgba(48,50,54,0.12)]">
      {/* Text section */}
      <div className="flex flex-row items-center gap-3 flex-1 max-w-[445px] h-6">
        <p className="font-medium text-base leading-6 tracking-[-0.01em] text-white max-w-[381px]">
          Get the NEAR Mobile app and don't miss anything!
        </p>
      </div>
      
      {/* Store buttons container */}
      <div className="flex flex-row items-center gap-2 w-[291px] h-10">
        {/* App Store Button */}
        <a
          href="https://apps.apple.com/app/near-mobile/id6443501225"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row justify-center items-center py-2 px-4 gap-2 w-[132px] h-10 bg-white bg-opacity-20 rounded-[100px] hover:bg-opacity-25 transition-all"
        >
          {/* Apple Logo */}
          <img 
            src="/icons/AppleLogo.svg" 
            alt="Apple" 
            className="w-5 h-5 flex-none"
          />
          <span className="font-medium text-sm leading-5 text-center tracking-[-0.01em] text-white w-[72px] h-5 flex-none">
            App Store
          </span>
        </a>
        
        {/* Google Play Button */}
        <a
          href="https://play.google.com/store/apps/details?id=com.peersyst.nearmobilewallet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row justify-center items-center py-2 px-4 gap-2 w-[151px] h-10 bg-white bg-opacity-20 rounded-[100px] hover:bg-opacity-25 transition-all"
        >
          {/* Google Play Logo */}
          <img 
            src="/icons/GooglePlayLogo.svg" 
            alt="Google Play" 
            className="w-5 h-5 flex-none"
          />
          <span className="font-medium text-sm leading-5 text-center tracking-[-0.01em] text-white w-[91px] h-5 flex-none">
            Google Play
          </span>
        </a>
      </div>
    </div>
  )
}
