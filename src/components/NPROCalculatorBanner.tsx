'use client'

interface NPROCalculatorBannerProps {
  onCalculateClick: () => void;
}

export default function NPROCalculatorBanner({ onCalculateClick }: NPROCalculatorBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:py-2 sm:px-4 sm:pr-2 gap-3 w-full min-h-14 bg-[#27282B] bg-opacity-90 rounded-[24px] sm:rounded-[100px] shadow-[0px_4px_16px_rgba(48,50,54,0.08)]">
      {/* Text section */}
      <div className="flex flex-row justify-center sm:justify-start items-center gap-3 flex-1 w-full sm:max-w-[445px] h-6">
        <p className="font-medium text-sm sm:text-base leading-5 sm:leading-6 tracking-[-0.01em] text-white text-center sm:text-left">
          Calculate NPRO rewards based on duration and amount.
        </p>
      </div>
      
      {/* Calculate button container */}
      <div className="flex items-center w-full xs:w-auto sm:w-auto">
        <button
          onClick={onCalculateClick}
          className="flex flex-row justify-center items-center py-2 px-4 gap-2 h-10 bg-white bg-opacity-90 rounded-[24px] xs:rounded-[100px] hover:bg-opacity-75 transition-all w-full xs:w-auto sm:w-auto min-w-[180px]"
        >
          <span className="font-medium text-sm leading-4 sm:leading-5 text-center tracking-[-0.01em] flex-none bg-gradient-to-r from-blue-400 via-purple-500 via-pink-500 to-blue-400 bg-clip-text text-transparent animate-[gradient_3s_ease-in-out_infinite] bg-[length:300%_100%]">
            Calculate rewards
          </span>
        </button>
      </div>
    </div>
  )
}