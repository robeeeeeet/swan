'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCraving: () => void;
}

export const SOSModal: FC<SOSModalProps> = ({
  isOpen,
  onClose,
  onRecordCraving,
}) => {
  const router = useRouter();

  const handleTimer = () => {
    onClose();
    router.push('/sos/timer');
  };

  const handleBreathing = () => {
    onClose();
    router.push('/sos/breathing');
  };

  const handleJustRecord = () => {
    onClose();
    onRecordCraving();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="吸いたい気持ち、わかります"
      size="md"
    >
      <div className="space-y-6">
        {/* メッセージ */}
        <div className="text-center">
          <div className="text-5xl mb-4">💪</div>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
            今が頑張りどころです。<br />
            この衝動は必ず過ぎ去ります。<br />
            一緒に乗り越えましょう。
          </p>
        </div>

        {/* SOS Options */}
        <div className="space-y-3">
          {/* 3分タイマー */}
          <button
            onClick={handleTimer}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-orange-200 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all text-left"
          >
            <div className="text-4xl mt-1">⏱️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                3分タイマー
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                まずは3分だけ待ってみましょう
              </p>
            </div>
            <div className="text-orange-500 mt-2">→</div>
          </button>

          {/* 深呼吸モード */}
          <button
            onClick={handleBreathing}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-teal-200 dark:border-teal-700 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 hover:border-teal-300 dark:hover:border-teal-600 transition-all text-left"
          >
            <div className="text-4xl mt-1">🌬️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-1">
                深呼吸モード
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300">
                呼吸法で心を落ち着けましょう
              </p>
            </div>
            <div className="text-teal-500 mt-2">→</div>
          </button>
        </div>

        {/* Just record */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="outline"
            fullWidth
            onClick={handleJustRecord}
          >
            今回は記録だけする
          </Button>
        </div>
      </div>
    </Modal>
  );
};
