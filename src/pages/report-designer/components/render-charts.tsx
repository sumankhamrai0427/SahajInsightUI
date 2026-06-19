import ChartCard from "./chart-card";
import BarChartGraph from "./bar-chart-graph";
import PieChartGraph from "./pie-chart-graph";
import type { ChartConfig } from "./ReportDesignerTable";
import MixedChartGraph from "./mixed-chart-graph";
import BubbleChartGraph from "./bubble-chart-graph";
import WaterfallChartGraph from "./waterfall-chart-graph";
import BoxPlotGraph from "./box-plot-graph";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import LineChartGraph from "./line-chart-graph";
interface RenderChartsProps {
  charts: ChartConfig[];
  onRemoveChart: (id: string) => void;
  onReorderCharts: (charts: ChartConfig[]) => void;
  onRenameChart?: (id: string, newName: string) => void;
    exportMode?:true
}
export default function RenderCharts({ charts, onRemoveChart, onReorderCharts, onRenameChart,exportMode }: RenderChartsProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(charts);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    onReorderCharts(items);
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case "bar":
        return <BarChartGraph config={chart} exportMode={exportMode} />;

      case "pie":
        return <PieChartGraph config={chart} />;

      case "kpi":
        return (
          <div className="text-4xl font-bold text-center py-12">
            {chart.rows.length}
          </div>
        );

      case "mixed":
        return <MixedChartGraph config={chart} />;

      case "bubble":
        return <BubbleChartGraph config={chart} />;

      case "waterfall":
        return <WaterfallChartGraph config={chart} />;

      case "box":
        return <BoxPlotGraph config={chart} />;
      case "line":
        return <LineChartGraph config={chart} />;

      default:
        return null;
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="charts">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        xl:grid-cols-2
        gap-3 
        sm:gap-4 
        xl:gap-5
        w-full
        max-w-[1200px]
      "
          >
            {charts.map((chart, index) => (
              <Draggable key={chart.id} draggableId={chart.id} index={index}>
                {(provided, snapshot) => (
                  <div key={chart.id}
                   
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`w-full transition ${snapshot.isDragging ? "ring-2 ring-indigo-400 rounded-xl" : ""
                      }`}
                  >
                    <ChartCard
                      id ={chart.id}
                      title={chart.customTitle || `${chart.type.toUpperCase()} Chart`}
                      description={
                        chart.xAxis ? `Based on ${chart.xAxis}` : "Chart"
                      }
                      onRemove={() => onRemoveChart(chart.id)}
                      onRename={(newName) => onRenameChart?.(chart.id, newName)}
                    >
                      {renderChart(chart)}
                    </ChartCard>

                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

    </DragDropContext>
  );
}

