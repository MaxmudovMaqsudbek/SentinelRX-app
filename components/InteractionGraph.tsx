import React, { useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G, Defs, RadialGradient, Stop, Rect, Pattern, Path } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from './ThemedText';
import { Spacing } from '@/constants/theme';

const GRAPH_HEIGHT = 220;

interface InteractionGraphProps {
  medications: string[];
  interactions: { drug1: string; drug2: string; severity: string }[];
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

export function InteractionGraph({ medications, interactions }: InteractionGraphProps) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Dynamic width calculation based on screen width and padding
  // PADDING (16*2) + MARGIN (4*2) + SAFETY (4) = ~44
  // We allow a bit more safety for parent containers
  const GRAPH_WIDTH = screenWidth - 64; 
  const CENTER_X = GRAPH_WIDTH / 2;
  const CENTER_Y = GRAPH_HEIGHT / 2;

  // Smart Layout Algorithm
  const nodes: Node[] = useMemo(() => {
    const count = medications.length;
    
    // Case 1: Duo (Classic Interaction Pair) -> Left/Right Split
    if (count === 2) {
        return [
            { id: medications[0], label: medications[0], x: GRAPH_WIDTH * 0.25, y: CENTER_Y },
            { id: medications[1], label: medications[1], x: GRAPH_WIDTH * 0.75, y: CENTER_Y }
        ];
    }
    
    // Case 2: Trio -> Triangle
    if (count === 3) {
         return [
            { id: medications[0], label: medications[0], x: CENTER_X, y: GRAPH_HEIGHT * 0.2 }, // Top
            { id: medications[1], label: medications[1], x: GRAPH_WIDTH * 0.8, y: GRAPH_HEIGHT * 0.8 }, // Bottom Right
            { id: medications[2], label: medications[2], x: GRAPH_WIDTH * 0.2, y: GRAPH_HEIGHT * 0.8 }  // Bottom Left
        ];
    }

    // Case 3: Cluster (Circular)
    const RADIUS = Math.min(GRAPH_WIDTH, GRAPH_HEIGHT) * 0.35;
    return medications.map((med, index) => {
      const angle = (index / count) * 2 * Math.PI - Math.PI / 2; 
      return {
        id: med,
        label: med.length > 8 ? med.substring(0, 6) + '..' : med,
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
      };
    });
  }, [medications, GRAPH_WIDTH, CENTER_X, CENTER_Y]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#F44336';
      case 'moderate': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1}}>
             <ThemedText type="h4" style={{marginRight: 8}}>Interaction Topology</ThemedText>
             <View style={[styles.liveBadge, {backgroundColor: theme.backgroundSecondary}]}>
                <View style={[styles.dot, {backgroundColor: theme.success}]} />
                <ThemedText type="small" style={{fontSize: 10, fontWeight: 'bold'}}>LIVE MODEL</ThemedText>
             </View>
        </View>
        <ThemedText type="small" style={{color: theme.textSecondary, marginTop: 4}}>
           {medications.length} Nodes • {interactions.length} Links
        </ThemedText>
      </View>

      <View style={styles.graphContainer}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Defs>
             <Pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <Path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.textSecondary} strokeWidth="0.5" strokeOpacity="0.1"/>
             </Pattern>
             <RadialGradient id="nodeGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={theme.primary} stopOpacity="0.4" />
                <Stop offset="1" stopColor={theme.primary} stopOpacity="0" />
             </RadialGradient>
          </Defs>
          
          {/* Background Grid */}
          <Rect x="0" y="0" width={GRAPH_WIDTH} height={GRAPH_HEIGHT} fill="url(#grid)" />

          {/* Edges */}
          {interactions.map((interaction, i) => {
            const startNode = nodes.find(n => interaction.drug1.includes(n.id) || n.id.includes(interaction.drug1));
            const endNode = nodes.find(n => interaction.drug2.includes(n.id) || n.id.includes(interaction.drug2));

            if (!startNode || !endNode) return null;

            return (
              <G key={`edge-${i}`}>
                  {/* Outer Glow for High Risk */}
                  {interaction.severity === 'High' && (
                     <Line
                        x1={startNode.x} y1={startNode.y}
                        x2={endNode.x} y2={endNode.y}
                        stroke={getSeverityColor(interaction.severity)}
                        strokeWidth={6}
                        strokeOpacity={0.2}
                      />
                  )}
                  <Line
                    x1={startNode.x} y1={startNode.y}
                    x2={endNode.x} y2={endNode.y}
                    stroke={getSeverityColor(interaction.severity)}
                    strokeWidth={2}
                    strokeDasharray={interaction.severity === 'Low' ? "5, 5" : undefined}
                  />
                  {/* Severity Label on Line */}
                   <Rect 
                        x={(startNode.x + endNode.x)/2 - 10} 
                        y={(startNode.y + endNode.y)/2 - 8} 
                        width="20" height="16" 
                        rx="4" 
                        fill={theme.cardBackground} 
                        stroke={getSeverityColor(interaction.severity)}
                   />
              </G>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
             const isSelected = selectedNode === node.id;
             return (
                <G 
                    key={`node-${i}`} 
                    onPress={() => setSelectedNode(isSelected ? null : node.id)}
                >
                    {/* Glow */}
                    {isSelected && <Circle cx={node.x} cy={node.y} r={30} fill="url(#nodeGlow)" />}
                    
                    {/* Pill Icon Body */}
                    <Rect
                        x={node.x - 20}
                        y={node.y - 12}
                        width={40}
                        height={24}
                        rx={12}
                        fill={theme.cardBackground}
                        stroke={isSelected ? theme.primary : theme.textSecondary}
                        strokeWidth={2}
                    />
                    {/* Pill Divider Line */}
                    <Line 
                        x1={node.x} y1={node.y - 12}
                        x2={node.x} y2={node.y + 12}
                        stroke={theme.border}
                        strokeWidth={1}
                    />

                    {/* Initials */}
                    <SvgText
                        x={node.x}
                        y={node.y + 4}
                        fill={theme.text}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {node.id.substring(0, 3).toUpperCase()}
                    </SvgText>

                    {/* Full Label */}
                    <SvgText
                        x={node.x}
                        y={node.y + 28}
                        fill={theme.textSecondary}
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="500"
                    >
                        {node.label}
                    </SvgText>
                </G>
             );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Better alignment when wrapping
    marginBottom: 12,
    flexWrap: 'wrap', // Allow header to wrap
  },
  liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    //   marginLeft: 8, // Removed margin to handle wrap better, handled by gap or margin right on title
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)'
  },
  dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4
  },
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    overflow: 'hidden',
    borderRadius: 8,
  },
});
