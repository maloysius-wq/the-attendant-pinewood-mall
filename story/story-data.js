import {CHARACTERS_V17} from './characters.js';
import {EVIDENCE_V17,LAST_SHIFT_IDS_V17} from './evidence.js';
import {CHAPTERS_V17} from './chapters.js';
import {TIMELINE_V17} from './timeline.js';
import {DIALOGUE_V17} from './dialogue.js';

export const STORY_DATA_V17={
  version:17,
  canon:'expanded-six-chapter',
  characters:CHARACTERS_V17,
  evidence:EVIDENCE_V17,
  lastShiftIds:LAST_SHIFT_IDS_V17,
  chapters:CHAPTERS_V17,
  timeline:TIMELINE_V17,
  dialogue:DIALOGUE_V17,
  endings:{standard:'pinewood_closed',true:'everyone_clocked_out'},
  flags:{
    reneeKnown:'renee_known',
    ticket1997:'ticket_1997_confirmed',
    gavinFound:'gavin_found',
    contractor13:'contractor_13_confirmed',
    luisPattern:'luis_pattern_confirmed',
    radioCompromised:'radio_compromised',
    eliFound:'eli_found',
    contractorHistory:'contractor_01_14_confirmed',
    contractor14Active:'contractor_14_active'
  }
};
