import React from "react";
import DashboardLayout from "../../../components/layout/dashboard-layout";
import { Box, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useState } from "react";
import { Search, Visibility } from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { useMemo } from "react";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  variant: "menu",
};
const analyzeRequest = async (postData) => {
  const resp = await axios.post("http://127.0.0.1:8000/analyze", postData);
  return resp.data;
};

const iocTypes = [
  {
    value: "ip",
    name: "IP Address",
  },
  {
    value: "email",
    name: "Email Address",
  },
  {
    value: "domain",
    name: "Domain Name",
  },
  {
    value: "url",
    name: "URL",
  },
  {
    value: "file",
    name: "File",
  },
];
const srcs = {
  emailRep: {
    type: "email",
    path: "analyzers.webAnalyzers.emailRep",
    className: "EmailRepClass",
  },
  robtex: {
    type: "observable",
    path: "analyzers.webAnalyzers.robtex",
    className: "Robtex",
  },
  geoIP2: {
    type: "ip",
    path: "analyzers.webAnalyzers.geoIP2",
    className: "GeoIP2",
    accountID: 771503,
    key: "fKh4TiE6RFjEKDo9",
  },
  abuseIPDB: {
    type: "ip",
    path: "analyzers.webAnalyzers.abuseIPDB",
    className: "AbuseIPDB",
    key: "02241dd0b2496a7dcc6ae14ec1791d8c4cb29cdc1ee5207ad82ab96cc4721a17b931a6420003a2a0",
  },
  honeyDB: {
    type: "ip",
    path: "analyzers.webAnalyzers.honeyDB",
    className: "HoneyDB",
    id: "2a7247b71a923763bb17dbf0185320742a972f64e5757ef9c0d5fe9918e4ec7c",
    key: "d72b1b4ff45ab4ba4284f62d6190963fbb88f2578974f02a5e7b6dbf0c24ee6d",
  },
  threatMiner: {
    type: "ip",
    path: "analyzers.webAnalyzers.threatMiner",
    className: "ThreatMiner",
  },
  virusTotal: {
    type: "observable",
    path: "analyzers.webAnalyzers.virusTotal",
    className: "VirusTotal",
    key: "45191dd08477e7c7ce89a32e4b7e8f46a6848fde192e9480ce67fa9872c9f2b2",
  },
  stringsifter: {
    type: "file",
    path: "analyzers.dockerAnalyzers.stringsifter",
    className: "StringSifter",
  },
};
export default function Investigate() {
  const { isLoading, mutateAsync } = useMutation(analyzeRequest, {
    onSuccess: (d) => {
      toast.success("Data Fetched");
      if (d) setData(d);
      else setData({});
      console.log("Data", d);
    },
    onError: (e) => {
      console.log("error", e);
      toast.error("Unable to fetch data. Try Again!");
    },
  });
  const router = useRouter();
  const ic = router.query?.slug?.[0];

  const [ioc, setIoc] = useState(ic ? ic : "");
  const [iocType, setIocType] = useState("ip");
  const sources = useMemo(() => {
    let srcList = [];
    for (const property in srcs) {
      console.log(`${property}: ${srcs[property]}`);
      if (
        srcs[property].type === iocType ||
        srcs[property].type === "observable"
      ) {
        srcList.push(property);
      }
    }
    return srcList;
  }, [iocType]);
  console.log("s", sources);
  const [selectedSources, setSelectedSources] = useState([]);
  console.log(selectedSources);
  const handleChange = (e) => {
    setIoc(e.target.value);
  };
  const handleChangeIocType = (e) => {
    setSelectedSources([]);
    setIocType(e.target.value);
  };
  const analyze = () => {
    let postData = {};
    console.log("v", validateEmail(ioc));

    const iocToAnalyze = ioc.includes("/")
      ? ioc.substring(0, ioc.indexOf("/"))
      : ioc;

    console.log("IOC", iocToAnalyze);
    postData = {
      ioc: iocToAnalyze,
      selected_analyzers: selectedSources,
      type: iocType,
    };

    console.log("Post Data", postData);
    toast.loading("Performing Enrichment");
    mutateAsync(postData)
      .then(() => {
        toast.dismiss();
        toast.success("Enriched " + iocType);
      })
      .catch((e) => {
        console.log(e);
        toast.dismiss();
        toast.error("Could not perform enrichment check logs for details");
      });
  };
  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  const [data, setData] = useState({});
  const handleChangeSelectedSources = (e) => {
    if (e.target.checked) {
      setSelectedSources([...selectedSources, e.target.value]);
    } else {
      setSelectedSources(
        selectedSources.filter((item) => item != e.target.value)
      );
    }
  };
  const handleSelectSources = (e) => {
    setSelectedSources(e.target.value);
  };
  return (
    <Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginTop: "50px",
          }}
        >
          <TextField
            sx={{
              width: "600px",
              marginRight: "5px",
            }}
            autoFocus
            margin="dense"
            name="ioc"
            value={ioc}
            onChange={handleChange}
            label="IOC"
            type="text"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <IconButton onClick={analyze}>
                  <Search
                    sx={{
                      color: "darkgray",
                    }}
                  />
                </IconButton>
              ),
            }}
          />
          <FormControl
            sx={{
              width: "120px",
            }}
          >
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={iocType}
              label="IOC Type"
              onChange={handleChangeIocType}
            >
              {iocTypes.map((type, index) => {
                return (
                  <MenuItem value={type.value} key={index}>
                    {type.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <FormControl
          sx={{
            width: "720px",
            marginTop: "5px",
          }}
        >
          <InputLabel id="demo-simple-select-label">Select Sorces</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedSources}
            multiple
            label="Select Sorces"
            onChange={handleSelectSources}
            MenuProps={MenuProps}
            renderValue={(selected) => selected.join(", ")}
          >
            {sources.map((source, index) => {
              return (
                <MenuItem value={source} key={index}>
                  <ListItemIcon>
                    <Checkbox checked={selectedSources.includes(source)} />
                  </ListItemIcon>
                  <ListItemText>{source}</ListItemText>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          marginTop: "30px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {selectedSources.map((source, index) => {
          return (
            <ResultsDisplay
              isIncluded={selectedSources.includes(source)}
              source={source}
              key={index}
              data={data}
              isLoading={isLoading}
            />
          );
        })}
      </Box>
    </Box>
  );
}

const ResultsDisplay = (props) => {
  const source = props.source;
  const data = props.data;
  const isIncluded = props.isIncluded;
  const isLoading = props.isLoading;
  const [expanded, setExpanded] = React.useState(false);
  const handleChangePanel = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return (
    <Accordion
      sx={{
        width: "90%",
      }}
      expanded={expanded === "panel1"}
      onChange={handleChangePanel("panel1")}
    >
      <AccordionSummary
        expandIcon={<Visibility />}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
      >
        <Typography sx={{ width: "33%", flexShrink: 0 }}>
          <b>{source}</b>
        </Typography>
        <Typography sx={{ color: "text.secondary" }}>
          {isIncluded && isLoading ? (
            <CircularProgress size="1.5rem" />
          ) : data[source] ? (
            "Data Fetched"
          ) : (
            "No Data"
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          maxHeight: "400px",
          overflowY: "scroll",
        }}
      >
        <Typography>
          {data[source] && (
            <pre
              style={{
                maxWidth: "100px",
              }}
            >
              {JSON.stringify(data[source], null, 2)}
            </pre>
          )}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};
Investigate.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
