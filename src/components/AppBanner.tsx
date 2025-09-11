export default function AppBanner() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:py-2 sm:px-4 sm:pr-2 gap-3 w-full min-h-14 bg-[#27282B] rounded-[24px] sm:rounded-[100px] shadow-[0px_4px_16px_rgba(48,50,54,0.12)]">
      {/* Text section */}
      <div className="flex flex-row justify-center sm:justify-start items-center gap-3 flex-1 w-full sm:max-w-[445px] h-6">
        <p className="font-medium text-sm sm:text-base leading-5 sm:leading-6 tracking-[-0.01em] text-white text-center sm:text-left">
          Get the NEAR Mobile app and don't miss anything!
        </p>
      </div>
      
      {/* Store buttons container */}
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full xs:w-auto sm:w-[291px]">
        {/* App Store Button */}
        <a
          href="https://apps.apple.com/app/near-mobile/id6443501225"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row justify-center items-center py-2 px-3 sm:px-4 gap-2 h-10 bg-white bg-opacity-20 rounded-[24px] xs:rounded-[100px] hover:bg-opacity-25 transition-all flex-1 xs:flex-none xs:w-[132px]"
        >
          {/* Apple Logo */}
          <img 
            src="/icons/AppleLogo.svg" 
            alt="Apple" 
            className="w-4 h-4 sm:w-5 sm:h-5 flex-none"
          />
          <span className="font-medium text-sm leading-4 sm:leading-5 text-center tracking-[-0.01em] text-white flex-none">
            App Store
          </span>
        </a>
        
        {/* Google Play Button */}
        <a
          href="https://play.google.com/store/apps/details?id=com.peersyst.nearmobilewallet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row justify-center items-center py-2 px-3 sm:px-4 gap-2 h-10 bg-white bg-opacity-20 rounded-[24px] xs:rounded-[100px] hover:bg-opacity-25 transition-all flex-1 xs:flex-none xs:w-[151px]"
        >
          {/* Google Play Logo */}
          <img 
            src="/icons/GooglePlayLogo.svg" 
            alt="Google Play" 
            className="w-4 h-4 sm:w-5 sm:h-5 flex-none"
          />
          <span className="font-medium text-sm leading-4 sm:leading-5 text-center tracking-[-0.01em] text-white flex-none">
            Google Play
          </span>
        </a>
      </div>
    </div>
  )
}
