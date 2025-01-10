import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import CheckIcon from "@mui/icons-material/Check";

interface LayerControlsProps {
  activeLayerName: string;
  toggleLayer: (name: string) => void;
}

const LayerControls = ({
  activeLayerName,
  toggleLayer,
}: LayerControlsProps) => {
  return (
    <List>
      {[
        "Dudu:Suitability of ...",
        "turkana_dec",
        "Ungrouped Layers",
        "Dudu:Population",
        "Base Maps",
      ].map((text, index) => (
        <ListItem key={text} disablePadding>
          <ListItemButton onClick={() => toggleLayer(text)}>
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
            {activeLayerName === text && <CheckIcon />}
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default LayerControls;
