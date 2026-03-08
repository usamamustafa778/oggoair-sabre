import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeft, Check } from "lucide-react";
import FullContainer from "./FullContainer";
import Container from "./Container";
import { isStepClickable, getPreviousStepUrl } from "@/utils/breadcrumbUtils";

const Breadcrumbs = ({ steps, currentStep }) => {
  const router = useRouter();
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleBackClick = () => {
    const previousUrl = getPreviousStepUrl(router, currentStep);
    if (previousUrl) {
      router.push(previousUrl);
    }
  };

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="pt-32">
      <FullContainer className="py-[40px]">
        <Container>
          {/* Mobile Version */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between mb-6">
              {/* Back button */}
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}

              {/* Current step */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-500">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mt-1">
                  {steps[currentStepIndex]?.label}
                </h2>
              </div>

              {/* Spacer for alignment */}
              <div className="w-16"></div>
            </div>

            {/* Mobile Progress Steps */}
            <div className="flex items-start justify-between relative">
              {/* Progress line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                <div
                  className="h-full bg-primary-text transition-all duration-300"
                  style={{
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>

              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === "completed"
                          ? "bg-primary-text border-2 border-primary-text"
                          : status === "current"
                          ? "bg-primary-text border-2 border-primary-text"
                          : "bg-[#c8ccd9] border-2 border-[#c8ccd9]"
                      }`}
                    >
                      <Check
                        className={`w-5.5 h-5.5 text-primary-green
                         `}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs mt-3 text-center max-w-[80px] leading-tight ${
                        status === "completed" || status === "current"
                          ? "text-primary-text font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Version */}
          <div className="hidden lg:grid grid-cols-5 items-start justify-between relative">
            {/* Progress line */}

            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = isStepClickable(index, currentStepIndex);

              const StepContent = (
                <div className="flex flex-col  items-center relative z-10 ">
                  {/* Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center z-10 justify-center transition-all duration-300 ${
                      status === "completed"
                        ? "bg-primary-text border-2 border-primary-text"
                        : status === "current"
                        ? "bg-primary-text border-2 border-primary-text"
                        : "bg-[#c8ccd9] border-2 border-[#c8ccd9]"
                    }`}
                  >
                    <Check
                      className={`w-5.5 h-5.5 text-primary-green
                       `}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-lg font-semibold mt-4 text-center  leading-tight ${
                      status === "completed" || status === "current"
                        ? "text-primary-text "
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  <div
                    className={`w-full h-[3px] absolute top-3.5 left-0 z-0 
                    ${
                      status === "completed"
                        ? "bg-primary-text"
                        : status === "current"
                        ? "bg-primary-text"
                        : "bg-[#c8ccd9]"
                    }
                    `}
                  ></div>
                </div>
              );

              return (
                <div key={step.id} className="w-full flex justify-center">
                  {isClickable && step.href ? (
                    <Link href={step.href} legacyBehavior>
                      <a className="cursor-pointer hover:opacity-80  w-full transition-opacity">
                        {StepContent}
                      </a>
                    </Link>
                  ) : (
                    <div
                      className={
                        isClickable
                          ? "cursor-pointer w-full"
                          : "cursor-default w-full"
                      }
                    >
                      {StepContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </FullContainer>
    </div>
  );
};

export default Breadcrumbs;
