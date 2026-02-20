import { describe, expect, it } from "vitest";
import * as accordion from "@/components/ui/accordion";
import * as alertDialog from "@/components/ui/alert-dialog";
import * as alert from "@/components/ui/alert";
import * as aspectRatio from "@/components/ui/aspect-ratio";
import * as avatar from "@/components/ui/avatar";
import * as badge from "@/components/ui/badge";
import * as breadcrumb from "@/components/ui/breadcrumb";
import * as button from "@/components/ui/button";
import * as calendar from "@/components/ui/calendar";
import * as card from "@/components/ui/card";
import * as carousel from "@/components/ui/carousel";
import * as chart from "@/components/ui/chart";
import * as checkbox from "@/components/ui/checkbox";
import * as collapsible from "@/components/ui/collapsible";
import * as command from "@/components/ui/command";
import * as contextMenu from "@/components/ui/context-menu";
import * as dialog from "@/components/ui/dialog";
import * as drawer from "@/components/ui/drawer";
import * as dropdownMenu from "@/components/ui/dropdown-menu";
import * as form from "@/components/ui/form";
import * as hoverCard from "@/components/ui/hover-card";
import * as inputOtp from "@/components/ui/input-otp";
import * as input from "@/components/ui/input";
import * as label from "@/components/ui/label";
import * as menubar from "@/components/ui/menubar";
import * as navigationMenu from "@/components/ui/navigation-menu";
import * as pagination from "@/components/ui/pagination";
import * as popover from "@/components/ui/popover";
import * as progress from "@/components/ui/progress";
import * as radioGroup from "@/components/ui/radio-group";
import * as resizable from "@/components/ui/resizable";
import * as scrollArea from "@/components/ui/scroll-area";
import * as select from "@/components/ui/select";
import * as separator from "@/components/ui/separator";
import * as sheet from "@/components/ui/sheet";
import * as sidebar from "@/components/ui/sidebar";
import * as skeleton from "@/components/ui/skeleton";
import * as slider from "@/components/ui/slider";
import * as sonner from "@/components/ui/sonner";
import * as switchMod from "@/components/ui/switch";
import * as table from "@/components/ui/table";
import * as tabs from "@/components/ui/tabs";
import * as textarea from "@/components/ui/textarea";
import * as toast from "@/components/ui/toast";
import * as toaster from "@/components/ui/toaster";
import * as toggleGroup from "@/components/ui/toggle-group";
import * as toggle from "@/components/ui/toggle";
import * as tooltip from "@/components/ui/tooltip";

describe("ui modules smoke/snapshot", () => {
  it("exports expected modules", () => {
    const modules = {
      accordion,
      alertDialog,
      alert,
      aspectRatio,
      avatar,
      badge,
      breadcrumb,
      button,
      calendar,
      card,
      carousel,
      chart,
      checkbox,
      collapsible,
      command,
      contextMenu,
      dialog,
      drawer,
      dropdownMenu,
      form,
      hoverCard,
      inputOtp,
      input,
      label,
      menubar,
      navigationMenu,
      pagination,
      popover,
      progress,
      radioGroup,
      resizable,
      scrollArea,
      select,
      separator,
      sheet,
      sidebar,
      skeleton,
      slider,
      sonner,
      switchMod,
      table,
      tabs,
      textarea,
      toast,
      toaster,
      toggleGroup,
      toggle,
      tooltip,
    };

    for (const [name, mod] of Object.entries(modules)) {
      expect(mod, `${name} should export something`).toBeTruthy();
      expect(Object.keys(mod).length).toBeGreaterThan(0);
    }

    expect(Object.fromEntries(Object.entries(modules).map(([k, v]) => [k, Object.keys(v)]))).toMatchSnapshot();
  });
});
