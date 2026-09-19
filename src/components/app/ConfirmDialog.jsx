import Sheet from './Sheet';
import Button from '../Button';

/** "Are you sure?" as a bottom sheet with a destructive and a cancel button. */
export default function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="m-0 mb-5 text-[14.5px] leading-relaxed opacity-70">{body}</p>
      <div className="flex flex-col gap-2.5">
        <Button variant="danger" block size="md" onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait…' : confirmLabel}
        </Button>
        <Button variant="secondary" block size="md" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </Sheet>
  );
}
