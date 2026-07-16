import GameIcon, { categoryColor } from './GameIcon';

const COMPLEXITY_DOTS = { Easy: 1, Medium: 2, Hard: 3 };
const ROTATIONS = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1'];
const TAG_ROTATIONS = ['rotate-2', '-rotate-2', 'rotate-1', '-rotate-1', 'rotate-3', '-rotate-3'];

export default function GameCard({ game, index, onCheckout, checkingOut }) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const tagRotation = TAG_ROTATIONS[index % TAG_ROTATIONS.length];
  const filledDots = COMPLEXITY_DOTS[game.complexity_rating] || 1;
  const color = categoryColor(game.category);
  const isOut = game.available_copies <= 0;
  const isLoading = checkingOut === game.name;

  return (
    <div className={`w-36 ${rotation} transition-transform hover:rotate-0 hover:scale-105`}>
      <div className="bg-[#FFF8ED] rounded-lg p-3 border border-[#F4A340]/30 shadow-md">
        <GameIcon category={game.category} className="mx-auto mb-2" />
        <p className="text-center text-[#3D2817] text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700 }}>
          {game.game_name}
        </p>
        <p className="text-center text-[#3D2817]/60 text-[11px] mt-0.5">
          {game.min_players}&ndash;{game.max_players} players
        </p>
        <div className="flex justify-center gap-1 mt-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i < filledDots ? color : '#F4A340' + '30' }}
            />
          ))}
        </div>
      </div>

      <div className={`bg-[#F4A340]/20 border border-dashed border-[#A9744F] rounded px-2.5 py-1 text-center ${tagRotation} w-fit mx-auto mt-1.5`}>
        <span className="text-[#3D2817] text-xs" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          &#8377;{game.rental_price}
        </span>
      </div>

      <button
        onClick={() => onCheckout(game)}
        disabled={isOut || isLoading}
        className="w-full mt-2 bg-[#2D6A4F] text-[#FFF8ED] text-xs py-1.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Checking out...' : isOut ? 'None available' : 'Check out'}
      </button>
    </div>
  );
}
