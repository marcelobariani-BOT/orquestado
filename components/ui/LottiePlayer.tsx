'use client';

import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottiePlayerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
  style?: React.CSSProperties;
}

export default function LottiePlayer({ animationData, style }: LottiePlayerProps) {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={style}
    />
  );
}
