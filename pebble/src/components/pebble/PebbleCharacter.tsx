'use client';

import { usePreferences } from '@/contexts/PreferencesContext';
import type { PebbleMood, PebbleModel } from '@/lib/types';
import ClassicModel from './models/ClassicModel';
import ChonkyModel from './models/ChonkyModel';
import MochiModel from './models/MochiModel';
import MinimalModel from './models/MinimalModel';
import ChonkyPlusModel from './models/ChonkyPlusModel';
import MochiPlusModel from './models/MochiPlusModel';
import MinimalPlusModel from './models/MinimalPlusModel';
import './PebbleModels.css';

interface PebbleCharacterProps {
  mood?: PebbleMood;
  size?: 'small' | 'medium' | 'large';
  model?: PebbleModel;
  className?: string;
}

const modelComponents: Record<PebbleModel, React.ComponentType<{ mood: PebbleMood }>> = {
  classic: ClassicModel,
  chonky: ChonkyModel,
  mochi: MochiModel,
  minimal: MinimalModel,
  'chonky-plus': ChonkyPlusModel,
  'mochi-plus': MochiPlusModel,
  'minimal-plus': MinimalPlusModel,
};

export default function PebbleCharacter({
  mood = 'normal',
  size = 'large',
  model,
  className = '',
}: PebbleCharacterProps) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;
  const activeModel = model ?? preferences.pebbleModel;
  const ModelComponent = modelComponents[activeModel];

  return (
    <div className={`pb-model pb-${activeModel} size-${size} mood-${mood} ${noMotion ? 'no-motion' : ''} ${className}`}>
      <div className="pb-float-wrapper">
        <ModelComponent mood={mood} />
      </div>
    </div>
  );
}
