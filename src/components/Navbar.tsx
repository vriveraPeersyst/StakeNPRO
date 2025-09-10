'use client'

export default function Navbar() {
  return (
    <nav className="w-full max-w-[760px] mx-auto px-4">
      <div className="flex flex-row items-center p-2 gap-3 w-full h-14 bg-white shadow-[0px_4px_16px_rgba(48,50,54,0.12)] rounded-xl">
        {/* Left - Logo */}
        <div className="flex flex-row items-center gap-3 w-60 h-10 flex-grow">
          <div className="flex flex-col justify-center items-center w-10 h-10 bg-gradient-to-r from-[#9797FF] to-[#17D9D4] rounded-[10px]">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#paint0_linear_1_255)"/>
              <path d="M28.2629 9.5H27.796C27.1365 9.5 26.5121 9.79045 26.086 10.2953L19.9971 17.5936V17.6247L13.8965 10.309C13.4744 9.80019 12.8499 9.5039 12.1904 9.5H11.7352C10.4999 9.5 9.50003 10.5039 9.50003 11.7398V28.2271C9.50003 29.2173 10.1148 30.1315 11.0602 30.4239C12.0737 30.7378 13.1184 30.3128 13.6417 29.459L18.0304 22.9327C18.186 22.7261 18.1451 22.4337 17.9389 22.2778C17.7541 22.1374 17.4954 22.155 17.33 22.3187L13.0114 26.0575C12.9413 26.1218 12.8324 26.1179 12.7682 26.0477C12.739 26.0146 12.7215 25.9717 12.7235 25.9269V14.1901C12.7235 14.0926 12.8032 14.0166 12.9005 14.0166C12.9511 14.0166 12.9997 14.04 13.0308 14.077L19.2443 21.5C19.8512 22.1355 20.2325 22.1238 20.7325 21.5234L26.9556 14.0633C26.9887 14.0244 27.0354 14.0029 27.0859 14.0029C27.1832 14.0029 27.261 14.0789 27.263 14.1764V25.9269C27.263 25.9717 27.2474 26.0146 27.2182 26.0477C27.154 26.1179 27.0451 26.1238 26.9751 26.0575L22.6564 22.3187C22.491 22.155 22.2323 22.1394 22.0475 22.2778C21.8413 22.4337 21.8024 22.7261 21.9561 22.9327L26.3448 29.459C26.7514 30.1218 27.4731 30.5273 28.2493 30.5273H28.257C29.4943 30.5312 30.5 29.5273 30.5 28.2875V11.7417C30.5 10.5039 29.4982 9.50195 28.2648 9.50195L28.2629 9.5Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear_1_255" x1="0" y1="20.0001" x2="40" y2="20.0001" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9797FF"/>
                  <stop offset="1" stopColor="#17D9D4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="w-[98px] h-6 font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-text">
            NEAR Mobile
          </span>
        </div>

        {/* Center - Menu */}
        <div className="flex flex-row justify-center items-center gap-3 w-60 h-6">
          <a
            href="https://nearmobile.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[45px] h-6 font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors"
          >
            Home
          </a>
          <div className="relative">
            <span className="w-[46px] h-6 font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-text cursor-pointer">
              NPRO
            </span>
            <div className="absolute w-[38px] h-1 left-1 -bottom-4 bg-primary"></div>
          </div>
          <a
            href="https://discord.com/invite/y3dsWCJFcM"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[62px] h-6 font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors"
          >
            Support
          </a>
          <a
            href="https://nearmobile.app/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[35px] h-6 font-sf font-medium text-base leading-6 tracking-[-0.01em] text-nm-muted cursor-pointer hover:text-nm-text transition-colors"
          >
            Blog
          </a>
        </div>

        {/* Right - Get the App Button */}
        <div className="flex justify-end items-center w-60 h-10">
          <a
            href="https://nearmobile.app/downloadredirect"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-row justify-center items-center px-4 py-2 gap-2 w-[121px] h-10 bg-primary rounded-full hover:opacity-80 transition-opacity"
          >
            <span className="w-[89px] h-6 font-sf font-medium text-base leading-6 text-center tracking-[-0.01em] text-white">
              Get the app
            </span>
          </a>
        </div>
      </div>
    </nav>
  )
}
