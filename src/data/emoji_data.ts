export type EmojiCategory =
  | 'smileys'
  | 'people'
  | 'animals'
  | 'food'
  | 'activities'
  | 'travel'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface EmojiEntry {
  char: string;
  name: string;
  category: EmojiCategory;
  keywords: string[];
}

export const EMOJI_CATEGORIES: {
  label: string;
  value: EmojiCategory;
}[] = [
  {
    label: 'Smileys & Emotion',
    value: 'smileys',
  },
  {
    label: 'People & Body',
    value: 'people',
  },
  {
    label: 'Animals & Nature',
    value: 'animals',
  },
  {
    label: 'Food & Drink',
    value: 'food',
  },
  {
    label: 'Activities',
    value: 'activities',
  },
  {
    label: 'Travel & Places',
    value: 'travel',
  },
  {
    label: 'Objects',
    value: 'objects',
  },
  {
    label: 'Symbols',
    value: 'symbols',
  },
  {
    label: 'Flags',
    value: 'flags',
  },
];

export const EMOJI_CATEGORY_ORDER: EmojiCategory[] = EMOJI_CATEGORIES.map(
  c => c.value,
);

export const EMOJI_CATEGORY_LABELS: Record<EmojiCategory, string> =
  Object.fromEntries(
    EMOJI_CATEGORIES.map(c => [
      c.value,
      c.label,
    ]),
  ) as Record<EmojiCategory, string>;

export const MOCK_EMOJIS: EmojiEntry[] = [
  {
    char: '😀',
    name: 'Grinning Face',
    category: 'smileys',
    keywords: [
      'happy',
      'smile',
      'grin',
    ],
  },
  {
    char: '😃',
    name: 'Grinning Face with Big Eyes',
    category: 'smileys',
    keywords: [
      'happy',
      'smile',
    ],
  },
  {
    char: '😄',
    name: 'Grinning Face with Smiling Eyes',
    category: 'smileys',
    keywords: [
      'happy',
      'joy',
    ],
  },
  {
    char: '😁',
    name: 'Beaming Face',
    category: 'smileys',
    keywords: [
      'happy',
      'grin',
      'teeth',
    ],
  },
  {
    char: '😆',
    name: 'Grinning Squinting Face',
    category: 'smileys',
    keywords: [
      'laugh',
      'happy',
    ],
  },
  {
    char: '😅',
    name: 'Grinning Face with Sweat',
    category: 'smileys',
    keywords: [
      'nervous',
      'laugh',
    ],
  },
  {
    char: '🤣',
    name: 'Rolling on the Floor Laughing',
    category: 'smileys',
    keywords: [
      'lol',
      'laugh',
      'rofl',
    ],
  },
  {
    char: '😂',
    name: 'Face with Tears of Joy',
    category: 'smileys',
    keywords: [
      'laugh',
      'cry',
      'happy',
    ],
  },
  {
    char: '🙂',
    name: 'Slightly Smiling Face',
    category: 'smileys',
    keywords: ['smile'],
  },
  {
    char: '😊',
    name: 'Smiling Face with Smiling Eyes',
    category: 'smileys',
    keywords: [
      'blush',
      'happy',
    ],
  },
  {
    char: '😇',
    name: 'Smiling Face with Halo',
    category: 'smileys',
    keywords: [
      'angel',
      'innocent',
    ],
  },
  {
    char: '🥰',
    name: 'Smiling Face with Hearts',
    category: 'smileys',
    keywords: [
      'love',
      'adore',
    ],
  },
  {
    char: '😍',
    name: 'Heart Eyes',
    category: 'smileys',
    keywords: [
      'love',
      'crush',
    ],
  },
  {
    char: '🤩',
    name: 'Star-Struck',
    category: 'smileys',
    keywords: [
      'wow',
      'star',
      'eyes',
    ],
  },
  {
    char: '😘',
    name: 'Face Blowing a Kiss',
    category: 'smileys',
    keywords: [
      'kiss',
      'love',
    ],
  },
  {
    char: '😜',
    name: 'Winking Face with Tongue',
    category: 'smileys',
    keywords: [
      'prank',
      'silly',
    ],
  },
  {
    char: '🤔',
    name: 'Thinking Face',
    category: 'smileys',
    keywords: [
      'think',
      'hmm',
    ],
  },
  {
    char: '😎',
    name: 'Smiling Face with Sunglasses',
    category: 'smileys',
    keywords: [
      'cool',
      'confident',
    ],
  },
  {
    char: '🤗',
    name: 'Hugging Face',
    category: 'smileys',
    keywords: [
      'hug',
      'warm',
    ],
  },
  {
    char: '😢',
    name: 'Crying Face',
    category: 'smileys',
    keywords: [
      'sad',
      'tear',
    ],
  },
  {
    char: '😭',
    name: 'Loudly Crying Face',
    category: 'smileys',
    keywords: [
      'cry',
      'sob',
      'sad',
    ],
  },
  {
    char: '😡',
    name: 'Pouting Face',
    category: 'smileys',
    keywords: [
      'angry',
      'mad',
      'rage',
    ],
  },
  {
    char: '🥺',
    name: 'Pleading Face',
    category: 'smileys',
    keywords: [
      'please',
      'puppy',
      'eyes',
    ],
  },
  {
    char: '😱',
    name: 'Face Screaming in Fear',
    category: 'smileys',
    keywords: [
      'scared',
      'shock',
    ],
  },
  {
    char: '🤯',
    name: 'Exploding Head',
    category: 'smileys',
    keywords: [
      'mind',
      'blown',
      'shock',
    ],
  },
  {
    char: '😴',
    name: 'Sleeping Face',
    category: 'smileys',
    keywords: [
      'sleep',
      'zzz',
      'tired',
    ],
  },
  {
    char: '👋',
    name: 'Waving Hand',
    category: 'people',
    keywords: [
      'wave',
      'hello',
      'bye',
    ],
  },
  {
    char: '🤚',
    name: 'Raised Back of Hand',
    category: 'people',
    keywords: [
      'hand',
      'stop',
    ],
  },
  {
    char: '✋',
    name: 'Raised Hand',
    category: 'people',
    keywords: [
      'high five',
      'stop',
    ],
  },
  {
    char: '🖐️',
    name: 'Hand with Fingers Splayed',
    category: 'people',
    keywords: [
      'hand',
      'five',
    ],
  },
  {
    char: '👌',
    name: 'OK Hand',
    category: 'people',
    keywords: [
      'ok',
      'perfect',
      'fine',
    ],
  },
  {
    char: '✌️',
    name: 'Victory Hand',
    category: 'people',
    keywords: [
      'peace',
      'victory',
      'two',
    ],
  },
  {
    char: '🤞',
    name: 'Crossed Fingers',
    category: 'people',
    keywords: [
      'luck',
      'hope',
    ],
  },
  {
    char: '🤟',
    name: 'Love-You Gesture',
    category: 'people',
    keywords: [
      'love',
      'sign',
    ],
  },
  {
    char: '👍',
    name: 'Thumbs Up',
    category: 'people',
    keywords: [
      'like',
      'approve',
      'yes',
    ],
  },
  {
    char: '👎',
    name: 'Thumbs Down',
    category: 'people',
    keywords: [
      'dislike',
      'no',
    ],
  },
  {
    char: '👏',
    name: 'Clapping Hands',
    category: 'people',
    keywords: [
      'clap',
      'bravo',
      'applause',
    ],
  },
  {
    char: '🙌',
    name: 'Raising Hands',
    category: 'people',
    keywords: [
      'celebrate',
      'hooray',
    ],
  },
  {
    char: '🤝',
    name: 'Handshake',
    category: 'people',
    keywords: [
      'deal',
      'agree',
      'meeting',
    ],
  },
  {
    char: '🙏',
    name: 'Folded Hands',
    category: 'people',
    keywords: [
      'pray',
      'please',
      'thanks',
    ],
  },
  {
    char: '💪',
    name: 'Flexed Biceps',
    category: 'people',
    keywords: [
      'strong',
      'muscle',
      'power',
    ],
  },
  {
    char: '🦶',
    name: 'Foot',
    category: 'people',
    keywords: [
      'foot',
      'kick',
    ],
  },
  {
    char: '👀',
    name: 'Eyes',
    category: 'people',
    keywords: [
      'look',
      'see',
      'watch',
    ],
  },
  {
    char: '👤',
    name: 'Bust in Silhouette',
    category: 'people',
    keywords: [
      'person',
      'user',
    ],
  },
  {
    char: '👥',
    name: 'Busts in Silhouette',
    category: 'people',
    keywords: [
      'people',
      'group',
    ],
  },
  {
    char: '🧑‍💻',
    name: 'Technologist',
    category: 'people',
    keywords: [
      'developer',
      'coder',
      'programmer',
    ],
  },
  {
    char: '🧑‍🎨',
    name: 'Artist',
    category: 'people',
    keywords: [
      'painter',
      'creative',
    ],
  },
  {
    char: '🧑‍🚀',
    name: 'Astronaut',
    category: 'people',
    keywords: [
      'space',
      'nasa',
    ],
  },
  {
    char: '🧑‍🍳',
    name: 'Cook',
    category: 'people',
    keywords: [
      'chef',
      'cooking',
    ],
  },
  {
    char: '🐶',
    name: 'Dog Face',
    category: 'animals',
    keywords: [
      'dog',
      'puppy',
      'pet',
    ],
  },
  {
    char: '🐱',
    name: 'Cat Face',
    category: 'animals',
    keywords: [
      'cat',
      'kitten',
      'pet',
    ],
  },
  {
    char: '🐭',
    name: 'Mouse Face',
    category: 'animals',
    keywords: [
      'mouse',
      'rodent',
    ],
  },
  {
    char: '🐹',
    name: 'Hamster',
    category: 'animals',
    keywords: [
      'hamster',
      'pet',
    ],
  },
  {
    char: '🐰',
    name: 'Rabbit Face',
    category: 'animals',
    keywords: [
      'rabbit',
      'bunny',
    ],
  },
  {
    char: '🦊',
    name: 'Fox',
    category: 'animals',
    keywords: [
      'fox',
      'clever',
    ],
  },
  {
    char: '🐻',
    name: 'Bear',
    category: 'animals',
    keywords: [
      'bear',
      'teddy',
    ],
  },
  {
    char: '🐼',
    name: 'Panda',
    category: 'animals',
    keywords: [
      'panda',
      'bear',
    ],
  },
  {
    char: '🐨',
    name: 'Koala',
    category: 'animals',
    keywords: [
      'koala',
      'australia',
    ],
  },
  {
    char: '🐯',
    name: 'Tiger Face',
    category: 'animals',
    keywords: [
      'tiger',
      'cat',
    ],
  },
  {
    char: '🦁',
    name: 'Lion',
    category: 'animals',
    keywords: [
      'lion',
      'king',
    ],
  },
  {
    char: '🐮',
    name: 'Cow Face',
    category: 'animals',
    keywords: [
      'cow',
      'moo',
    ],
  },
  {
    char: '🐷',
    name: 'Pig Face',
    category: 'animals',
    keywords: [
      'pig',
      'oink',
    ],
  },
  {
    char: '🐸',
    name: 'Frog',
    category: 'animals',
    keywords: [
      'frog',
      'toad',
    ],
  },
  {
    char: '🐵',
    name: 'Monkey Face',
    category: 'animals',
    keywords: [
      'monkey',
      'ape',
    ],
  },
  {
    char: '🐔',
    name: 'Chicken',
    category: 'animals',
    keywords: [
      'chicken',
      'hen',
    ],
  },
  {
    char: '🐧',
    name: 'Penguin',
    category: 'animals',
    keywords: [
      'penguin',
      'bird',
    ],
  },
  {
    char: '🦅',
    name: 'Eagle',
    category: 'animals',
    keywords: [
      'eagle',
      'bird',
    ],
  },
  {
    char: '🦋',
    name: 'Butterfly',
    category: 'animals',
    keywords: [
      'butterfly',
      'insect',
    ],
  },
  {
    char: '🐢',
    name: 'Turtle',
    category: 'animals',
    keywords: [
      'turtle',
      'slow',
    ],
  },
  {
    char: '🐍',
    name: 'Snake',
    category: 'animals',
    keywords: [
      'snake',
      'python',
    ],
  },
  {
    char: '🐳',
    name: 'Spouting Whale',
    category: 'animals',
    keywords: [
      'whale',
      'ocean',
    ],
  },
  {
    char: '🐬',
    name: 'Dolphin',
    category: 'animals',
    keywords: [
      'dolphin',
      'sea',
    ],
  },
  {
    char: '🌸',
    name: 'Cherry Blossom',
    category: 'animals',
    keywords: [
      'flower',
      'spring',
      'sakura',
    ],
  },
  {
    char: '🌻',
    name: 'Sunflower',
    category: 'animals',
    keywords: [
      'flower',
      'sun',
    ],
  },
  {
    char: '🌲',
    name: 'Evergreen Tree',
    category: 'animals',
    keywords: [
      'tree',
      'pine',
      'forest',
    ],
  },
  {
    char: '🍎',
    name: 'Red Apple',
    category: 'food',
    keywords: [
      'apple',
      'fruit',
    ],
  },
  {
    char: '🍊',
    name: 'Tangerine',
    category: 'food',
    keywords: [
      'orange',
      'fruit',
    ],
  },
  {
    char: '🍋',
    name: 'Lemon',
    category: 'food',
    keywords: [
      'lemon',
      'citrus',
    ],
  },
  {
    char: '🍌',
    name: 'Banana',
    category: 'food',
    keywords: [
      'banana',
      'fruit',
    ],
  },
  {
    char: '🍉',
    name: 'Watermelon',
    category: 'food',
    keywords: [
      'watermelon',
      'fruit',
    ],
  },
  {
    char: '🍇',
    name: 'Grapes',
    category: 'food',
    keywords: [
      'grapes',
      'wine',
      'fruit',
    ],
  },
  {
    char: '🍓',
    name: 'Strawberry',
    category: 'food',
    keywords: [
      'strawberry',
      'fruit',
    ],
  },
  {
    char: '🍕',
    name: 'Pizza',
    category: 'food',
    keywords: [
      'pizza',
      'food',
    ],
  },
  {
    char: '🍔',
    name: 'Hamburger',
    category: 'food',
    keywords: [
      'burger',
      'food',
    ],
  },
  {
    char: '🍟',
    name: 'French Fries',
    category: 'food',
    keywords: [
      'fries',
      'chips',
    ],
  },
  {
    char: '🌮',
    name: 'Taco',
    category: 'food',
    keywords: [
      'taco',
      'mexican',
    ],
  },
  {
    char: '🍣',
    name: 'Sushi',
    category: 'food',
    keywords: [
      'sushi',
      'japanese',
    ],
  },
  {
    char: '🍜',
    name: 'Steaming Bowl',
    category: 'food',
    keywords: [
      'ramen',
      'noodle',
      'soup',
    ],
  },
  {
    char: '🍩',
    name: 'Doughnut',
    category: 'food',
    keywords: [
      'donut',
      'sweet',
    ],
  },
  {
    char: '🍪',
    name: 'Cookie',
    category: 'food',
    keywords: [
      'cookie',
      'sweet',
    ],
  },
  {
    char: '🎂',
    name: 'Birthday Cake',
    category: 'food',
    keywords: [
      'cake',
      'birthday',
    ],
  },
  {
    char: '🍰',
    name: 'Shortcake',
    category: 'food',
    keywords: [
      'cake',
      'dessert',
    ],
  },
  {
    char: '☕',
    name: 'Hot Beverage',
    category: 'food',
    keywords: [
      'coffee',
      'tea',
      'hot',
    ],
  },
  {
    char: '🍺',
    name: 'Beer Mug',
    category: 'food',
    keywords: [
      'beer',
      'drink',
    ],
  },
  {
    char: '🍷',
    name: 'Wine Glass',
    category: 'food',
    keywords: [
      'wine',
      'drink',
    ],
  },
  {
    char: '🧃',
    name: 'Beverage Box',
    category: 'food',
    keywords: [
      'juice',
      'drink',
    ],
  },
  {
    char: '🧁',
    name: 'Cupcake',
    category: 'food',
    keywords: [
      'cupcake',
      'sweet',
      'dessert',
    ],
  },
  {
    char: '⚽',
    name: 'Soccer Ball',
    category: 'activities',
    keywords: [
      'soccer',
      'football',
    ],
  },
  {
    char: '🏀',
    name: 'Basketball',
    category: 'activities',
    keywords: [
      'basketball',
      'sport',
    ],
  },
  {
    char: '🏈',
    name: 'American Football',
    category: 'activities',
    keywords: [
      'football',
      'sport',
    ],
  },
  {
    char: '⚾',
    name: 'Baseball',
    category: 'activities',
    keywords: [
      'baseball',
      'sport',
    ],
  },
  {
    char: '🎾',
    name: 'Tennis',
    category: 'activities',
    keywords: [
      'tennis',
      'sport',
    ],
  },
  {
    char: '🏐',
    name: 'Volleyball',
    category: 'activities',
    keywords: [
      'volleyball',
      'sport',
    ],
  },
  {
    char: '🎮',
    name: 'Video Game',
    category: 'activities',
    keywords: [
      'game',
      'controller',
      'play',
    ],
  },
  {
    char: '🎲',
    name: 'Game Die',
    category: 'activities',
    keywords: [
      'dice',
      'game',
      'chance',
    ],
  },
  {
    char: '🎯',
    name: 'Bullseye',
    category: 'activities',
    keywords: [
      'target',
      'dart',
    ],
  },
  {
    char: '🎸',
    name: 'Guitar',
    category: 'activities',
    keywords: [
      'guitar',
      'music',
      'rock',
    ],
  },
  {
    char: '🎹',
    name: 'Musical Keyboard',
    category: 'activities',
    keywords: [
      'piano',
      'music',
    ],
  },
  {
    char: '🎤',
    name: 'Microphone',
    category: 'activities',
    keywords: [
      'mic',
      'karaoke',
      'sing',
    ],
  },
  {
    char: '🎬',
    name: 'Clapper Board',
    category: 'activities',
    keywords: [
      'movie',
      'film',
    ],
  },
  {
    char: '🎨',
    name: 'Artist Palette',
    category: 'activities',
    keywords: [
      'art',
      'paint',
      'draw',
    ],
  },
  {
    char: '🏆',
    name: 'Trophy',
    category: 'activities',
    keywords: [
      'trophy',
      'win',
      'champion',
    ],
  },
  {
    char: '🥇',
    name: 'Gold Medal',
    category: 'activities',
    keywords: [
      'gold',
      'first',
      'winner',
    ],
  },
  {
    char: '🎪',
    name: 'Circus Tent',
    category: 'activities',
    keywords: [
      'circus',
      'tent',
    ],
  },
  {
    char: '🎭',
    name: 'Performing Arts',
    category: 'activities',
    keywords: [
      'theater',
      'drama',
      'masks',
    ],
  },
  {
    char: '🚗',
    name: 'Automobile',
    category: 'travel',
    keywords: [
      'car',
      'drive',
    ],
  },
  {
    char: '🚕',
    name: 'Taxi',
    category: 'travel',
    keywords: [
      'taxi',
      'cab',
    ],
  },
  {
    char: '🚌',
    name: 'Bus',
    category: 'travel',
    keywords: [
      'bus',
      'transit',
    ],
  },
  {
    char: '🚀',
    name: 'Rocket',
    category: 'travel',
    keywords: [
      'rocket',
      'launch',
      'space',
    ],
  },
  {
    char: '✈️',
    name: 'Airplane',
    category: 'travel',
    keywords: [
      'airplane',
      'flight',
      'travel',
    ],
  },
  {
    char: '🚂',
    name: 'Locomotive',
    category: 'travel',
    keywords: [
      'train',
      'steam',
    ],
  },
  {
    char: '🚢',
    name: 'Ship',
    category: 'travel',
    keywords: [
      'ship',
      'boat',
      'cruise',
    ],
  },
  {
    char: '🏠',
    name: 'House',
    category: 'travel',
    keywords: [
      'house',
      'home',
    ],
  },
  {
    char: '🏢',
    name: 'Office Building',
    category: 'travel',
    keywords: [
      'office',
      'building',
      'work',
    ],
  },
  {
    char: '🏥',
    name: 'Hospital',
    category: 'travel',
    keywords: [
      'hospital',
      'health',
    ],
  },
  {
    char: '🏫',
    name: 'School',
    category: 'travel',
    keywords: [
      'school',
      'education',
    ],
  },
  {
    char: '⛰️',
    name: 'Mountain',
    category: 'travel',
    keywords: [
      'mountain',
      'nature',
    ],
  },
  {
    char: '🌋',
    name: 'Volcano',
    category: 'travel',
    keywords: [
      'volcano',
      'eruption',
    ],
  },
  {
    char: '🏖️',
    name: 'Beach with Umbrella',
    category: 'travel',
    keywords: [
      'beach',
      'vacation',
    ],
  },
  {
    char: '🌅',
    name: 'Sunrise',
    category: 'travel',
    keywords: [
      'sunrise',
      'morning',
    ],
  },
  {
    char: '🌈',
    name: 'Rainbow',
    category: 'travel',
    keywords: [
      'rainbow',
      'colors',
    ],
  },
  {
    char: '🌙',
    name: 'Crescent Moon',
    category: 'travel',
    keywords: [
      'moon',
      'night',
    ],
  },
  {
    char: '⭐',
    name: 'Star',
    category: 'travel',
    keywords: [
      'star',
      'favorite',
    ],
  },
  {
    char: '🌍',
    name: 'Globe Europe-Africa',
    category: 'travel',
    keywords: [
      'earth',
      'globe',
      'world',
    ],
  },
  {
    char: '💡',
    name: 'Light Bulb',
    category: 'objects',
    keywords: [
      'idea',
      'light',
      'bulb',
    ],
  },
  {
    char: '📱',
    name: 'Mobile Phone',
    category: 'objects',
    keywords: [
      'phone',
      'mobile',
      'cell',
    ],
  },
  {
    char: '💻',
    name: 'Laptop',
    category: 'objects',
    keywords: [
      'laptop',
      'computer',
    ],
  },
  {
    char: '⌨️',
    name: 'Keyboard',
    category: 'objects',
    keywords: [
      'keyboard',
      'type',
    ],
  },
  {
    char: '🖥️',
    name: 'Desktop Computer',
    category: 'objects',
    keywords: [
      'computer',
      'desktop',
      'monitor',
    ],
  },
  {
    char: '📷',
    name: 'Camera',
    category: 'objects',
    keywords: [
      'camera',
      'photo',
    ],
  },
  {
    char: '📚',
    name: 'Books',
    category: 'objects',
    keywords: [
      'books',
      'read',
      'study',
    ],
  },
  {
    char: '📝',
    name: 'Memo',
    category: 'objects',
    keywords: [
      'note',
      'write',
      'memo',
    ],
  },
  {
    char: '📎',
    name: 'Paperclip',
    category: 'objects',
    keywords: [
      'paperclip',
      'attach',
    ],
  },
  {
    char: '✏️',
    name: 'Pencil',
    category: 'objects',
    keywords: [
      'pencil',
      'write',
      'edit',
    ],
  },
  {
    char: '🔑',
    name: 'Key',
    category: 'objects',
    keywords: [
      'key',
      'lock',
      'password',
    ],
  },
  {
    char: '🔒',
    name: 'Locked',
    category: 'objects',
    keywords: [
      'lock',
      'secure',
      'private',
    ],
  },
  {
    char: '🔓',
    name: 'Unlocked',
    category: 'objects',
    keywords: [
      'unlock',
      'open',
    ],
  },
  {
    char: '📦',
    name: 'Package',
    category: 'objects',
    keywords: [
      'package',
      'box',
      'delivery',
    ],
  },
  {
    char: '🗑️',
    name: 'Wastebasket',
    category: 'objects',
    keywords: [
      'trash',
      'delete',
      'bin',
    ],
  },
  {
    char: '📅',
    name: 'Calendar',
    category: 'objects',
    keywords: [
      'calendar',
      'date',
      'schedule',
    ],
  },
  {
    char: '⏰',
    name: 'Alarm Clock',
    category: 'objects',
    keywords: [
      'alarm',
      'clock',
      'time',
    ],
  },
  {
    char: '🔔',
    name: 'Bell',
    category: 'objects',
    keywords: [
      'bell',
      'notification',
    ],
  },
  {
    char: '💎',
    name: 'Gem Stone',
    category: 'objects',
    keywords: [
      'gem',
      'diamond',
      'jewel',
    ],
  },
  {
    char: '🧲',
    name: 'Magnet',
    category: 'objects',
    keywords: [
      'magnet',
      'attract',
    ],
  },
  {
    char: '🔧',
    name: 'Wrench',
    category: 'objects',
    keywords: [
      'wrench',
      'tool',
      'fix',
    ],
  },
  {
    char: '⚙️',
    name: 'Gear',
    category: 'objects',
    keywords: [
      'gear',
      'settings',
      'cog',
    ],
  },
  {
    char: '❤️',
    name: 'Red Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'red',
    ],
  },
  {
    char: '🧡',
    name: 'Orange Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'orange',
    ],
  },
  {
    char: '💛',
    name: 'Yellow Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'yellow',
    ],
  },
  {
    char: '💚',
    name: 'Green Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'green',
    ],
  },
  {
    char: '💙',
    name: 'Blue Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'blue',
    ],
  },
  {
    char: '💜',
    name: 'Purple Heart',
    category: 'symbols',
    keywords: [
      'love',
      'heart',
      'purple',
    ],
  },
  {
    char: '✅',
    name: 'Check Mark Button',
    category: 'symbols',
    keywords: [
      'check',
      'done',
      'yes',
    ],
  },
  {
    char: '❌',
    name: 'Cross Mark',
    category: 'symbols',
    keywords: [
      'no',
      'wrong',
      'delete',
    ],
  },
  {
    char: '⚠️',
    name: 'Warning',
    category: 'symbols',
    keywords: [
      'warning',
      'caution',
      'alert',
    ],
  },
  {
    char: '❓',
    name: 'Question Mark',
    category: 'symbols',
    keywords: [
      'question',
      'help',
    ],
  },
  {
    char: '❗',
    name: 'Exclamation Mark',
    category: 'symbols',
    keywords: [
      'exclamation',
      'important',
    ],
  },
  {
    char: '💯',
    name: 'Hundred Points',
    category: 'symbols',
    keywords: [
      'hundred',
      'perfect',
      'score',
    ],
  },
  {
    char: '♻️',
    name: 'Recycling Symbol',
    category: 'symbols',
    keywords: [
      'recycle',
      'green',
    ],
  },
  {
    char: '🔴',
    name: 'Red Circle',
    category: 'symbols',
    keywords: [
      'red',
      'circle',
      'stop',
    ],
  },
  {
    char: '🟢',
    name: 'Green Circle',
    category: 'symbols',
    keywords: [
      'green',
      'circle',
      'go',
    ],
  },
  {
    char: '🔵',
    name: 'Blue Circle',
    category: 'symbols',
    keywords: [
      'blue',
      'circle',
    ],
  },
  {
    char: '⬆️',
    name: 'Up Arrow',
    category: 'symbols',
    keywords: [
      'up',
      'arrow',
    ],
  },
  {
    char: '⬇️',
    name: 'Down Arrow',
    category: 'symbols',
    keywords: [
      'down',
      'arrow',
    ],
  },
  {
    char: '➡️',
    name: 'Right Arrow',
    category: 'symbols',
    keywords: [
      'right',
      'arrow',
    ],
  },
  {
    char: '⬅️',
    name: 'Left Arrow',
    category: 'symbols',
    keywords: [
      'left',
      'arrow',
    ],
  },
  {
    char: '🔗',
    name: 'Link',
    category: 'symbols',
    keywords: [
      'link',
      'chain',
      'url',
    ],
  },
  {
    char: '💬',
    name: 'Speech Balloon',
    category: 'symbols',
    keywords: [
      'chat',
      'message',
      'talk',
    ],
  },
  {
    char: '🇺🇸',
    name: 'Flag: United States',
    category: 'flags',
    keywords: [
      'usa',
      'america',
      'flag',
    ],
  },
  {
    char: '🇬🇧',
    name: 'Flag: United Kingdom',
    category: 'flags',
    keywords: [
      'uk',
      'britain',
      'flag',
    ],
  },
  {
    char: '🇫🇷',
    name: 'Flag: France',
    category: 'flags',
    keywords: [
      'france',
      'flag',
    ],
  },
  {
    char: '🇩🇪',
    name: 'Flag: Germany',
    category: 'flags',
    keywords: [
      'germany',
      'flag',
    ],
  },
  {
    char: '🇯🇵',
    name: 'Flag: Japan',
    category: 'flags',
    keywords: [
      'japan',
      'flag',
    ],
  },
  {
    char: '🇰🇷',
    name: 'Flag: South Korea',
    category: 'flags',
    keywords: [
      'korea',
      'flag',
    ],
  },
  {
    char: '🇨🇳',
    name: 'Flag: China',
    category: 'flags',
    keywords: [
      'china',
      'flag',
    ],
  },
  {
    char: '🇧🇷',
    name: 'Flag: Brazil',
    category: 'flags',
    keywords: [
      'brazil',
      'flag',
    ],
  },
  {
    char: '🇮🇳',
    name: 'Flag: India',
    category: 'flags',
    keywords: [
      'india',
      'flag',
    ],
  },
  {
    char: '🇦🇺',
    name: 'Flag: Australia',
    category: 'flags',
    keywords: [
      'australia',
      'flag',
    ],
  },
  {
    char: '🇨🇦',
    name: 'Flag: Canada',
    category: 'flags',
    keywords: [
      'canada',
      'flag',
    ],
  },
  {
    char: '🇪🇸',
    name: 'Flag: Spain',
    category: 'flags',
    keywords: [
      'spain',
      'flag',
    ],
  },
  {
    char: '🇮🇹',
    name: 'Flag: Italy',
    category: 'flags',
    keywords: [
      'italy',
      'flag',
    ],
  },
  {
    char: '🇲🇽',
    name: 'Flag: Mexico',
    category: 'flags',
    keywords: [
      'mexico',
      'flag',
    ],
  },
  {
    char: '🇷🇺',
    name: 'Flag: Russia',
    category: 'flags',
    keywords: [
      'russia',
      'flag',
    ],
  },
  {
    char: '🇵🇹',
    name: 'Flag: Portugal',
    category: 'flags',
    keywords: [
      'portugal',
      'flag',
    ],
  },
  {
    char: '🇦🇷',
    name: 'Flag: Argentina',
    category: 'flags',
    keywords: [
      'argentina',
      'flag',
    ],
  },
  {
    char: '🏳️‍🌈',
    name: 'Rainbow Flag',
    category: 'flags',
    keywords: [
      'pride',
      'rainbow',
      'lgbtq',
    ],
  },
];
