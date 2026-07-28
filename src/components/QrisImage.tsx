export default function QrisImage() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-56 h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-5xl mb-2">📱</div>
          <p className="text-xs text-gray-500 font-medium">QRIS Donasi</p>
          <p className="text-[10px] text-gray-400 mt-1">Scan untuk berdonasi</p>
        </div>
      </div>
      <p className="text-xs text-gray-500">a.n. Panitia HUT RI ke-81 Blok Mawar</p>
    </div>
  );
}
