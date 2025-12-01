import { Check, X } from "lucide-react";
import { validatePassword, getStrengthColor, getStrengthBgColor, getStrengthPercentage } from "@/lib/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) => {
  const validation = validatePassword(password);
  const { strength, requirements } = validation;

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={`font-medium capitalize ${getStrengthColor(strength)}`}>
            {strength}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthBgColor(strength)}`}
            style={{ width: `${getStrengthPercentage(strength)}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Requirements:</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <RequirementItem
              met={requirements.minLength}
              text="At least 8 characters"
            />
            <RequirementItem
              met={requirements.hasUppercase}
              text="One uppercase letter (A-Z)"
            />
            <RequirementItem
              met={requirements.hasLowercase}
              text="One lowercase letter (a-z)"
            />
            <RequirementItem
              met={requirements.hasNumber}
              text="One number (0-9)"
            />
            <RequirementItem
              met={requirements.hasSpecialChar}
              text="One special character (!@#$%...)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem = ({ met, text }: RequirementItemProps) => {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      )}
      <span className={met ? "text-green-700" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
};
