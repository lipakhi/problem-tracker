
import ProblemTagSelector from "./ProblemTagSelector";

interface ProblemTagsProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
}

const ProblemTags = ({ tags, onTagsChange }: ProblemTagsProps) => {
  return (
    <ProblemTagSelector tags={tags} onTagsChange={onTagsChange} />
  );
};

export default ProblemTags;
