import { SkipToContent } from '@/lib/accessibility';
import { CheckCircle, Crown, Medal, Star, Trophy } from '@phosphor-icons/react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ranks = [
  { name: 'Bronze', min: 0, perks: ['Biaya normal', 'Akses fitur dasar'] },
  { name: 'Silver', min: 500, perks: ['Diskon biaya 5%', 'Priority chat support'] },
  { name: 'Gold', min: 2000, perks: ['Diskon biaya 10%', 'Pencairan prioritas'] },
  { name: 'Platinum', min: 5000, perks: ['Diskon biaya 15%', 'Badge eksklusif'] },
];

export default function RewardRank() {
  return (
    <DashboardLayout title="Rank Keanggotaan" subtitle="Level akun berdasarkan aktivitas transaksi">
      <div className="max-w-2xl mx-auto space-y-5">
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Rank saat ini</p>
              <h2 className="text-2xl font-bold">Silver Member</h2>
              <p className="text-sm mt-1 text-white/90">760 poin lagi menuju Gold</p>
            </div>
            <Trophy className="w-1 aria-hidden="true"0 h-10" weight="duotone" aria-hidden="true" />
          </div>
        </section>

        <section className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-4">
          {ranks.map((rank, idx) => (
            <div key={rank.name} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{rank.name}</p>
                <div className="text-xs px-2 py-1 rounded-full bg-neutral-100">Min. {rank.min} poin</div>
              </div>
              <ul className="space-y-1.5">
                {rank.perks.map((perk) => (
                  <li key={perk} className="text-sm text-neutral-600 flex items-center gap-2">
                    <CheckCircle className="w-4 aria-hidden="true" h-4 text-emerald-500" weight="fill" aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
                {idx === 0 && <Medal className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />}
                {idx === 1 && <Star className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />}
                {idx === 2 && <Crown className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />}
                {idx === 3 && <Trophy className="w-4 aria-hidden="true" h-4" weight="regular" aria-hidden="true" />}
                Program benefit dapat berubah sesuai kebijakan Kahade.
              </div>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
