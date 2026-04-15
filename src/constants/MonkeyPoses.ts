import { ImageSourcePropType } from 'react-native';
import { MonkeyState } from '../types/Chat';

// All require() calls are explicit — Metro needs static strings, no dynamic paths.
export const MONKEY_POSES: Record<MonkeyState, ImageSourcePropType> = {
  idle:          require('../../assets/monkey/calm.png'),
  thinking:      require('../../assets/monkey/contemplative.png'),
  responding:    require('../../assets/monkey/thoughtful.png'),
  contemplative: require('../../assets/monkey/contemplative.png'),
  wise:          require('../../assets/monkey/seated.png'),
  amused:        require('../../assets/monkey/dancing.png'),
  playful:       require('../../assets/monkey/playful.png'),
  serene:        require('../../assets/monkey/serene.png'),
  concerned:     require('../../assets/monkey/thoughtful-alt.png'),
  reflective:    require('../../assets/monkey/pipe.png'),
  exasperated:   require('../../assets/monkey/angry.png'),
  monkey:        require('../../assets/monkey/minimalist.png'),
  // New poses
  curious:       require('../../assets/monkey/curious.png'),
  distressed:    require('../../assets/monkey/distressed.png'),
  focused:       require('../../assets/monkey/focused.png'),
  snacking:      require('../../assets/monkey/snacking.png'),
  praying:       require('../../assets/monkey/praying.png'),
  singing:       require('../../assets/monkey/singing.png'),
  teaching:      require('../../assets/monkey/teaching.png'),
  sneaky:        require('../../assets/monkey/sneaky.png'),
  surprised:     require('../../assets/monkey/surprised.png'),
};
