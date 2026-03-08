
// Modern Futuristic Loading Components
const FuturisticLoader = ({ size = "large" }) => {
  const dimensions =
    size === "large"
      ? "w-32 h-32"
      : size === "medium"
      ? "w-16 h-16"
      : "w-8 h-8";

  return (
    <div className="relative flex items-center justify-center">
      {/* Main spinning circle with morphing animation */}
      <div
        className={`${dimensions} border-4 border-transparent border-t-primary-text morphing-loader pulse-glow`}
      ></div>

      {/* Orbiting ring */}
      <div
        className={`absolute ${dimensions} border-2 border-primary-text/20 rounded-full orbit-ring`}
      ></div>

      {/* Inner quantum dots */}
      <div className="absolute flex space-x-1">
        <div
          className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Data stream particles */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary-text/60 rounded-full data-stream"
            style={{
              left: `${20 + i * 10}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

const NeuralNetworkLoader = () => (
  <div className="relative w-24 h-24 flex items-center justify-center">
    {/* Central node */}
    <div className="w-4 h-4 bg-primary-text rounded-full neural-pulse"></div>

    {/* Connecting nodes */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-primary-text/70 rounded-full neural-pulse"
        style={{
          transform: `rotate(${i * 45}deg) translateY(-20px)`,
          animationDelay: `${i * 0.2}s`,
        }}
      ></div>
    ))}

    {/* Connection lines */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-px h-5 bg-gradient-to-t from-primary-text/30 to-transparent"
        style={{
          transform: `rotate(${i * 45}deg) translateY(-10px)`,
          transformOrigin: "bottom",
        }}
      ></div>
    ))}
  </div>
);

// Enhanced Skeleton loading components with subtle animations
const FlightCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-4">
        <div
          className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded morphing-loader"
          style={{ animationDuration: "4s" }}
        ></div>
        <div>
          <div
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 mb-2 neural-pulse"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 neural-pulse"
            style={{ animationDuration: "2.5s" }}
          ></div>
        </div>
      </div>
      <div className="text-right">
        <div
          className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-1 neural-pulse"
          style={{ animationDuration: "2.8s" }}
        ></div>
        <div
          className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 neural-pulse"
          style={{ animationDuration: "3.2s" }}
        ></div>
      </div>
    </div>

    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-8">
        <div>
          <div
            className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-1 neural-pulse"
            style={{ animationDuration: "2.3s" }}
          ></div>
          <div
            className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 neural-pulse"
            style={{ animationDuration: "2.7s" }}
          ></div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 neural-pulse"
            style={{ animationDuration: "3.1s" }}
          ></div>
          <div
            className="w-6 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full futuristic-spinner"
            style={{ animationDuration: "1.5s" }}
          ></div>
          <div
            className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 neural-pulse"
            style={{ animationDuration: "2.9s" }}
          ></div>
        </div>
        <div>
          <div
            className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-1 neural-pulse"
            style={{ animationDuration: "2.6s" }}
          ></div>
          <div
            className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 neural-pulse"
            style={{ animationDuration: "3.4s" }}
          ></div>
        </div>
      </div>
      <div
        className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 neural-pulse"
        style={{ animationDuration: "2.4s" }}
      ></div>
    </div>

    <div className="flex justify-between items-center text-sm">
      <div className="flex space-x-4">
        <div
          className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 neural-pulse"
          style={{ animationDuration: "2.8s" }}
        ></div>
        <div
          className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 neural-pulse"
          style={{ animationDuration: "3.3s" }}
        ></div>
      </div>
      <div
        className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 neural-pulse"
        style={{ animationDuration: "2.5s" }}
      ></div>
    </div>
  </div>
);

const FilterSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-pulse">
    <div
      className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-4 neural-pulse"
      style={{ animationDuration: "2.1s" }}
    ></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center space-x-3">
          <div
            className="w-4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded quantum-dot"
            style={{ animationDelay: `${item * 0.2}s` }}
          ></div>
          <div
            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 neural-pulse"
            style={{ animationDuration: `${2 + item * 0.1}s` }}
          ></div>
        </div>
      ))}
    </div>
  </div>
);

export default function LoadingComponent({ option = "default" }) {
  if (option === "search-page") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FuturisticLoader size="large" />
          <p className="mt-6 text-lg text-primary-text font-medium">
            Searching for hotels...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Please wait while we find the best options
          </p>
        </div>
      </div>
    );
  }

  if (option === "flight-search") {
    return (
      <div className="bg-primary-bg min-h-screen pb-8 pt-5">
        <div className="max-w-screen-2xl mx-auto px-2 w-11/12 mt-32">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left sidebar skeleton */}
            <div className="w-full lg:w-[32.5%] flex-shrink-0 space-y-6">
              <FilterSkeleton />
              <FilterSkeleton />
              <FilterSkeleton />
            </div>

            {/* Main content skeleton */}
            <div className="w-full lg:w-[67.5%] lg:min-w-0">
              {/* Date selector skeleton */}
              <div className="bg-white rounded-xl border-gray-200 mb-4 p-4">
                <div className="flex justify-between items-center">
                  <div
                    className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded futuristic-spinner"
                    style={{ animationDuration: "2s" }}
                  ></div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div
                        key={item}
                        className="w-20 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded neural-pulse"
                        style={{
                          animationDuration: `${2 + item * 0.1}s`,
                          animationDelay: `${item * 0.1}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div
                    className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded futuristic-spinner"
                    style={{
                      animationDuration: "2s",
                      animationDirection: "reverse",
                    }}
                  ></div>
                </div>
              </div>

              {/* Filter tabs skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 mb-4 p-4">
                <div className="flex space-x-8">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex-1">
                      <div
                        className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 mb-2 neural-pulse"
                        style={{ animationDuration: `${2.2 + item * 0.1}s` }}
                      ></div>
                      <div
                        className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 neural-pulse"
                        style={{ animationDuration: `${2.5 + item * 0.1}s` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight cards skeleton */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <FlightCardSkeleton key={item} />
                ))}
              </div>

              {/* Enhanced Loading indicator */}
              <div className="flex flex-col items-center justify-center py-12">
                <FuturisticLoader size="medium" />
                <div className="mt-6 text-center">
                  <p className="text-xl text-primary-text font-semibold">
                    Searching for the best flights...
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Analyzing thousands of options in real-time
                  </p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <div
                      className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
                      style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary-text rounded-full quantum-dot"
                      style={{ animationDelay: "0.6s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (option === "flight-results-loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mb-6">
            <NeuralNetworkLoader />
          </div>
          <p className="text-xl text-primary-text font-semibold mb-2">
            Finding flights...
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Connecting to airline systems worldwide
          </p>
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-primary-text rounded-full data-stream"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <FuturisticLoader size="large" />
        <p className="mt-6 text-lg text-primary-text font-medium">Loading...</p>
      </div>
    </div>
  );
}
