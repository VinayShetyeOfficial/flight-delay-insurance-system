import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WalletAddressDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void;
  initialAddress?: string;
}

export function WalletAddressDialog({
  open,
  onClose,
  onConfirm,
  initialAddress = "",
}: WalletAddressDialogProps) {
  const [address, setAddress] = React.useState(initialAddress);
  const [error, setError] = React.useState("");
  const [editMode, setEditMode] = React.useState(
    initialAddress === "" ? true : false
  );

  React.useEffect(() => {
    setAddress(initialAddress);
    setError("");
    setEditMode(initialAddress === "" ? true : false);
  }, [open, initialAddress]);

  function isValidEthAddress(addr: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  const handleConfirm = () => {
    if (!isValidEthAddress(address)) {
      setError("Please enter a valid Ethereum wallet address (0x...)");
      return;
    }
    setError("");
    onConfirm(address);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your Wallet Address</DialogTitle>
          <DialogDescription>
            {editMode || !initialAddress ? (
              <>
                To receive compensation for flight delays, please provide your
                MetaMask (Ethereum) wallet address. This is required for
                insurance payouts.
              </>
            ) : (
              <>
                Please confirm your associated wallet address for insurance
                payout.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <Input
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoFocus
            maxLength={42}
            readOnly={!editMode && !!initialAddress}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          {editMode || !initialAddress ? (
            <Button onClick={handleConfirm} type="button">
              Confirm
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onConfirm(address)}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm
              </Button>
              <Button
                variant="secondary"
                onClick={() => setEditMode(true)}
                type="button"
              >
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
