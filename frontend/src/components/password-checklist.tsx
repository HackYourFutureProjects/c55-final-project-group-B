import { passwordRules } from "@/lib/validation";
import styles from "./password-checklist.module.css";
import { CheckIcon, XIcon } from "@phosphor-icons/react/ssr";

export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className={styles.rules}>
      {passwordRules.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={passed ? styles.rulePassed : styles.ruleFailed}
          >
            {passed ? (
              <CheckIcon weight="duotone" />
            ) : (
              <XIcon weight="duotone" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
