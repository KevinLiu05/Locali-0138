"use client"

export function LoginAnimation() {
  return (
    <div className="relative w-[300px] h-[250px]">
      {/* Orange semi-circle */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 300 100" className="w-full">
          <path d="M 0,100 L 300,100 L 300,50 A 150,150 0 0,0 0,50 Z" fill="#FB923C" />
          <circle cx="120" cy="70" r="4" fill="black" />
          <circle cx="150" cy="70" r="4" fill="black" />
          <circle cx="180" cy="70" r="4" fill="black" />
        </svg>
      </div>

      {/* Purple rectangle */}
      <div
        className="absolute left-[15%] bottom-[30%] w-[80px] h-[180px] origin-bottom-left"
        style={{ transform: "rotate(-15deg)" }}
      >
        <div className="relative w-full h-full bg-[#6366F1] rounded-lg">
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 space-y-4">
            <div className="flex space-x-4">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="w-1 h-6 bg-white mx-auto rounded-full" />
          </div>
        </div>
      </div>

      {/* Black rectangle */}
      <div
        className="absolute left-[35%] bottom-[35%] w-[70px] h-[140px] origin-bottom-left"
        style={{ transform: "rotate(10deg)" }}
      >
        <div className="relative w-full h-full bg-black rounded-lg">
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2">
            <div className="flex space-x-4">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Yellow shape */}
      <div
        className="absolute right-[25%] bottom-[40%] w-[60px] h-[120px] origin-bottom-right"
        style={{ transform: "rotate(-5deg)" }}
      >
        <div className="relative w-full h-full bg-[#FCD34D] rounded-lg">
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 space-y-3">
            <div className="w-1.5 h-1.5 rounded-full bg-black mx-auto" />
            <div className="w-4 h-0.5 bg-black mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

