import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

/**
 * The `Toaster` component renders a list of toast notifications using the `useToast` hook. It
 * provides a container for displaying toast messages with titles, descriptions, actions, and a
 * close button. The component also includes a viewport for managing the display of toasts.
 *
 * @returns A JSX element that renders the toast notifications within a `ToastProvider`.
 */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title != null && <ToastTitle>{title}</ToastTitle>}
              {description != null && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
