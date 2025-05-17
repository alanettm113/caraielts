'use client';

import { useEffect, useState, useRef } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Clock as ClockIcon, 
        Loader2, 
        Expand, 
        SendHorizontal, 
        SquarePen, 
        MoveHorizontal, 
        ArrowDown,
        ChevronLeft,
        ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import Image from 'next/image';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

// Define the Question type
type Question = {
  number: number;
  question_text: string;
  type: 'dropdown' | 'text' | 'mcq' | 'HeadingMatch' | 'MatchPerson' | 'TFNG' | 'YNNG' | 'MultipleChoice' | 'ShortAnswer' | 'GapFill';
  options?: string[];
  answer?: string;
};

// Define test data for Test 1
const passages: Record<number, string> = {
  1: `READING PASSAGE 1
\nThe Pesticide-Free Village

\nGerry Marten and Dona Glee Williams report on reliance on the Indian village of Punukula, which was nearly destroyed by dependence on pesticides.

\nAround 20 years ago, a handful of families migrated from the Guntur district of Andhra Pradesh, south-east India, to Punukula, a community of approximately 900 people farming plots of 2 to 10 acres. The newcomers introduced cotton farming, attracting local farmers with the promise of greater profits than the mixed crops they were growing for food and sale, such as millet, mung beans, chilli, and rice. However, cotton farming required the use of pesticides and fertilisers, which were unfamiliar to the mostly illiterate local farmers.

\nLocal agrochemical dealers filled the need for information and supplies. These "middlemen" sold commercial seeds, fertilisers, and insecticides on credit, guaranteeing the purchase of the crops. They also provided technical advice supplied by the companies that sold their products. Farmers depended on the dealers, and if they wanted to grow cotton — which they did — they had no other option.

\nInitially, the high yields and incomes from cotton farming attracted farmers. The outlay for insecticides was low, as cotton pests had not yet arrived. Many farmers were so impressed by the chemicals that they started using them on other crops. The immediate benefits from cotton farming masked the environmental degradation that was happening as a result.

\nSoon, cotton-eating pests, like bollworms and aphids, plagued the fields. Repeated pesticide spraying killed the most vulnerable pests, leaving the stronger ones to reproduce and pass on their resistance. As the pests grew tougher, farmers applied more insecticides, sometimes mixing as many as ten different chemicals. At the same time, cotton farming depleted the soil of nutrients, forcing farmers to use more fertilisers.

\nBy the time some farmers tried to break free from their chemical dependence, insecticides had already wiped out many of the natural predators, such as birds, wasps, and beetles, that previously controlled the pests. Without these predators, the pests flourished if the use of insecticides was reduced. As the costs of fertilisers and insecticides increased, the cost of cotton production soared, and many farmers fell deeper into debt.

\nThe cycle of chemical dependence was broken when a respected village elder decided to experiment with a different method. He was one of the first to grow cotton and would become the first to try it without chemicals. The approach was part of a programme in Non-Pesticide Management (NPM), developed with the help of an NGO called SECURE, which had recognized the environmental and financial difficulties caused by chemical farming.

\nNPM involved the use of neem, a fast-growing evergreen tree related to mahogany, which naturally repels insects. Neem produces pesticides that are harmless to humans and animals, including the beneficial insects that eat pests.

\nNeem is native to India and Burma, where it has been used for centuries for pest control and health benefits. To use neem for cotton farming, seeds are ground into a powder, soaked overnight in water, and sprayed onto the crop every 10 days. Neem cake, which is applied to the soil, kills pests and acts as an organic fertiliser rich in nitrogen. Neem is locally grown and inexpensive compared to chemical insecticides, making it a cost-effective alternative.

\nFarmers quickly saw the benefits of NPM, with harvests as good as those from chemical-dependent cotton farming, and they saved money by not buying insecticides. Instead of spending scarce cash on chemicals, they invested time and effort into NPM practices. By the end of 2000, all farmers in Punukula had switched to NPM, and they began using it on other crops as well. The status and economic opportunities for women improved, and NPM practices spread, as women began gathering neem seeds to sell to other villages.

\nIn 2004, the village government declared Punukula a pesticide-free village. The village now serves as a model for spreading NPM to other communities, with approximately 2,000 farmers visiting each year. What began with a few farmers trying to escape the dangers of pesticides has grown into a movement with the potential to help an entire region recover from ecological disaster.
`,
  2: `READING PASSAGE 2
\nWater Filter

\nAn ingenious invention is set to bring clean water to developing countries, and while the science may be cutting edge, the materials are extremely down to earth.

\nA. A handful of clay yesterday’s coffee grounds and some cow manure are the ingredients that could bring clean, safe drinking water to much of the third world.

\nB. The simple new technology, developed by ANU materials scientist Mr. Tony Flynn, allows water filters to be made from commonly available materials and fired on the ground using cow manure as the source of heat, without the need for a kiln. The filters have been tested and shown to remove common pathogens (disease-producing organisms) including E-coli. Unlike other water filtering devices, the filters are simple and inexpensive to make. “They are very simple to explain and demonstrate and can be made by anyone, anywhere,” says Mr. Flynn. “They don’t require any western technology. All you need is terracotta clay, a compliant cow and a match.”

\nC. The production of the filters is extremely simple. Take a handful of dry, crushed clay, mix it with a handful of organic material, such as used tea leaves, coffee grounds or rice hulls, add enough water to make a stiff biscuit-like mixture and form a cylindrical pot that has one end closed, then dry it in the sun. According to Mr. Flynn, used coffee grounds have given the best results to date. Next, surround the pots with straw; put them in a mound of cow manure, light the straw and then top up the burning manure as required. In less than 60 minutes the filters are finished. The walls of the finished pot should be about as thick as an adult’s index. The properties of cow manure are vital as the fuel can reach a temperature of 700 degrees in half an hour and will be up to 950 degrees after another 20 to 30 minutes. The manure makes a good fuel because it is very high in organic material that burns readily and quickly; the manure has to be dry and is best used exactly as found in the field, there is no need to break it up or process it any further.

\nD. “A potter’s kiln is an expensive item and can could take up to four or five hours to get upto 800 degrees. It needs expensive or scarce fuel, such as gas or wood to heat it and experience to run it. With no technology, no insulation and nothing other than a pile of cow manure and a match, none of these restrictions apply,” Mr. Flynn says.

\nE. It is also helpful that, like terracotta clay and organic material, cow dung is freely available across the developing world. “A cow is a natural fuel factory. My understanding is that cow dung as a fuel would be pretty much the same wherever you would find it.” Just as using manure as a fuel for domestic uses is not a new idea, the porosity of clay is something that potters have known about for years, and something that as a former ceramics lecturer in the ANU School of Art, Mr. Flynn is well aware of. The difference is that rather than viewing the porous nature of the material as a problem — after all not many people want a pot that won’t hold water — his filters capitalize on this property.

\nF. Other commercial ceramic filters do exist, but, even if available, with prices starting at US$5 each, they are often outside the budgets of most people in the developing world. The filtration process is simple, but effective. The basic principle is that there are passages through the filter that are wide enough for water droplets to pass through, but too narrow for pathogens. Tests with the deadly E-coli bacterium have seen the filters remove 96.4 to 99.8 per cent of the pathogen — well within safe levels. Using only one filter it takes two hours to filter a litre of water. The use of organic material, which burns away after firing, helps produce the structure in which pathogens will become trapped. It overcomes the potential problems of finer clays that may not let water through and also means that cracks are soon halted. And like clay and cow dung, it is universally available.

\nG. The invention was born out of a World Vision project involving the Manatuto community in East Timor. The charity wanted to help set up a small industry manufacturing water filters, but initial research found the local clay to be too fine — a problem solved by the addition of organic material. While the problems of producing a working ceramic filter in East Timor were overcome, the solution was kiln-based and particular to that community’s materials and couldn’t be applied elsewhere. Manure firing, with no requirement for a kiln, has made this zero technology approach available anywhere it is needed. With all the components being widely available, Mr. Flynn says there is no reason the technology couldn’t be applied throughout the developing world, and with no plans to patent his idea, there will be no legal obstacles to it being adopted in any community that needs it. “Everyone has a right to clean water, these filters have the potential to enable anyone in the world to drink water safely,” says Mr. Flynn.
`,
  3: `READING PASSAGE 3
\nPutting the Brakes on Climate Change: Are Hydrogen Cars the Answer?

\nA. It is tempting to think that the conservation of coral reefs and rainforests is a separate issue from traffic and air pollution. But it is not. Scientists are now confident that rapid changes in the Earth’s climate are already disrupting and altering many wildlife habitats. Pollution from vehicles is a big part of the problem.

\nB. The United Nation’s Climate Change Panel has estimated that the global average temperature rise expected by the year 2100 could be as much as 6°C, causing forest fires and dieback on land and coral bleaching in the ocean. Few species, if any, will be immune from the changes in temperature, rainfall and sea levels. The panel believes that if such catastrophic temperature rises are to be avoided, the quantity of greenhouse gases, especially carbon dioxide, being released into the atmosphere must be reduced. That will depend on slowing the rate of deforestation and, more crucially, finding alternatives to coal, oil and gas as our principal energy sources.

\nC. Technologies do exist to reduce or eliminate carbon dioxide as a waste product of our energy consumption. Wind power and solar power are both spreading fast, but what are we doing about traffic? Electric cars are one possible option, but their range and the time it takes to charge their batteries pose serious limitations. However, the technology that shows the most potential to make cars climate-friendly is fuel-cell technology. This was actually invented in the late nineteenth century, but because the world’s motor industry put its effort into developing the combustion engine, it was never refined for mass production. One of the first prototype fuel-cell-powered vehicles have been built by the Ford Motor Company. It is like a conventional car, only with better acceleration and a smoother ride. Ford engineers expect to be able to produce a virtually silent vehicle in the future.

\nD. So what’s the process involved – and is there a catch? Hydrogen goes into the fuel tank, producing electricity. The only emission from the exhaust pipe is water. The fuel-cell is, in some ways similar to a battery, but unlike a battery, it does not run down. As long as hydrogen and oxygen are supplied to the cell, it will keep on generating electricity. Some cells work off methane and a few use liquid fuels such as methanol, but fuel-cells using hydrogen probably have the most potential. Furthermore, they need not be limited to transport. Fuel-cells can be made in a huge range of size, small enough for portable computers or large enough for power stations. They have no moving parts and therefore need no oil. They just need a supply of hydrogen. The big question, then, is where to get it from.

\nE. One source of hydrogen is water. But to exploit the abundant resource, electricity is needed, and if the electricity is produced by a coal-fired power station or other fossil fuel, then the overall carbon reduction benefit of the fuel-cell disappears. Renewable sources, such as wind and solar power, do not produce enough energy for it to be economically viable to use them in the ‘manufacture’ of hydrogen as a transport fuel. Another source of hydrogen is, however, available and could provide a supply pending the development of more efficient and cheaper renewable energy technologies. By splitting natural gas (methane) into its constituent parts, hydrogen and carbon dioxide are produced. One way round the problem of what to do with the carbon dioxide could be to store it back below ground – so-called geological sequestration. Oil companies, such as Norway’s Statoil, are experimenting with storing carbon dioxide below ground in oil and gas wells.

\nF. With freak weather conditions, arguably caused by global warming, frequently in the headlines, the urgent need to get fuel-cell vehicles will be available in most showrooms. Even now, fuel-cell buses are operating in the US, while in Germany a courier company is planning to take delivery of fuel-cell-powered vans in the near future. The fact that centrally-run fleets of buses and vans are the first fuel-cell vehicles identifies another challenge – fuel distribution. The refueling facilities necessary to top up hydrogen-powered vehicles are available only in a very few places at present. Public transport and delivery firms are logical places to start since their vehicles are operated from central depots.

\nG. Fuel-cell technology is being developed right across the automotive industry. This technology could have a major impact in slowing down climate change, but further investment is needed if the industry – and the world’s wildlife – is to have a long-term future.
`,
};


// Questions for Passage 1
const passage1Questions: Question[] = [
  { 
    number: 1, 
    question_text: 'Cotton growing was expected to raise more money than other crops.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 2, 
    question_text: 'Some of the local agro-chemical dealers had been farmers in the past.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 3, 
    question_text: 'Initially the farmers’ cotton yields were low.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 4, 
    question_text: 'At first, the farmers failed to notice the negative effects on their fields of pesticide use.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 5, 
    question_text: 'Based on the use of an _____', 
    type: 'text',
  },
  { 
    number: 6, 
    question_text: 'Neem contains many _____ that target plant-eating predators', 
    type: 'text',
  },
  { 
    number: 7, 
    question_text: 'Neem: _____ formed by grinding seeds', 
    type: 'text',
  },
  { 
    number: 8, 
    question_text: 'Neem: Left _____ to soak in water', 
    type: 'text',
  },
  { 
    number: 9, 
    question_text: 'Neem: Added in _____ form to soil', 
    type: 'text',
  },
  { 
    number: 10, 
    question_text: 'Neem: Contains a lot of _____', 
    type: 'text',
  },
  { 
    number: 11, 
    question_text: 'In which year did farmers finally stop using chemicals on cotton crops in Punukula?', 
    type: 'text',
  },
  { 
    number: 12, 
    question_text: 'What did the women of Punukula collect to make money?', 
    type: 'text',
  },
  { 
    number: 13, 
    question_text: 'What project do the authorities in Punukula hope to set up in the future?', 
    type: 'text',
  },
];

// Questions for Passage 2
const passage2Questions: Question[] = [
  { 
    number: 14, 
    question_text: 'Make the mixture for the filter from organic material (e.g. tea, coffee, rice), _____ and _____.', 
    type: 'text',
  },
  { 
    number: 15, 
    question_text: 'Make the mixture for the filter from organic material (e.g. tea, coffee, rice), clay and _____.', 
    type: 'text',
  },
  { 
    number: 16, 
    question_text: 'Shape into pots and place them in a fire made from _____ and cow manure.', 
    type: 'text',
  },
  { 
    number: 17, 
    question_text: 'Shape into pots and place them in a fire made from straw and _____.', 
    type: 'text',
  },
  { 
    number: 18, 
    question_text: 'Fuel the fire to reach a maximum heat of _____.', 
    type: 'text',
  },
  { 
    number: 19, 
    question_text: 'Bake the filters in the fire for a maximum period of _____.', 
    type: 'text',
  },
  { 
    number: 20, 
    question_text: 'The clay in the Manatuto project was initially unsuitable for the project\'s purpose.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 21, 
    question_text: 'Coffee grounds produce filters that are twice as efficient as those using other organic materials.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 22, 
    question_text: 'It takes half an hour for a cow-manure fire to reach 950 degrees.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 23, 
    question_text: 'E-coli is the most difficult bacterium to remove from water by filtration.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 24, 
    question_text: 'The Manatuto project aimed to set up a', 
    type: 'mcq', 
    options: [
      'A. charitable trust.',
      'B. filtration experiment.',
      'C. water filter factory.',
      'D. community kiln.',
    ],
  },
  { 
    number: 25, 
    question_text: 'To be effective, the Flynn filters must', 
    type: 'mcq', 
    options: [
      'A. remove all dangerous pathogens.',
      'B. be a particular thickness.',
      'C. filter water as quickly as possible.',
      'D. be made from 100 per cent clay.',
    ],
  },
  { 
    number: 26, 
    question_text: 'Flynn does not intend to patent his filter because he', 
    type: 'mcq', 
    options: [
      'A. wants it be freely available.',
      'B. has produced a very simple design.',
      'C. cannot make a profit in poor countries.',
      'D. has already given the idea to a charity.',
    ],
  },
];

// Questions for Passage 3
const passage3Questions: Question[] = [
  { 
    number: 27, 
    question_text: 'Paragraph A', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 28, 
    question_text: 'Paragraph B', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 29, 
    question_text: 'Paragraph C', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 30, 
    question_text: 'Paragraph D', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 31, 
    question_text: 'Paragraph E', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 32, 
    question_text: 'Paragraph F', 
    type: 'HeadingMatch', 
    options: [
      'i. Action already taken by the United Nations',
      'ii. Marketing the hydrogen car',
      'iii. Making the new technology available worldwide',
      'iv. Some negative predictions from one group of experts',
      'v. How the new vehicle technology works',
      'vi. The history of fuel-cell technology',
      'vii. A holistic view of climatic change',
      'viii. Locating the essential ingredient',
      'ix. Sustaining car manufacture',
    ],
  },
  { 
    number: 33, 
    question_text: 'In the late nineteenth century, the car industry invested in the development of the _____, rather than fuel-cell technology.', 
    type: 'text',
  },
  { 
    number: 34, 
    question_text: 'Ford engineers predict that they will eventually design an almost _____ car.', 
    type: 'text',
  },
  { 
    number: 35, 
    question_text: 'While a fuel-cell lasts longer, some aspects of it are comparable to a _____.', 
    type: 'text',
  },
  { 
    number: 36, 
    question_text: 'Fuel-cells can come in many sizes and can be used in power stations and in _____ as well as in vehicles.', 
    type: 'text',
  },
  { 
    number: 37, 
    question_text: 'Using electricity produced by burning fossil fuels to access sources of hydrogen may increase the positive effect of the fuel-cell.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 38, 
    question_text: 'The oil company Statoil in Norway owns gas wells in other parts of the world.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 39, 
    question_text: 'Public transport is leading the way in the application of fuel-cell technology.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
  { 
    number: 40, 
    question_text: 'More funding is necessary to ensure the success of the fuel-cell vehicle industry.', 
    type: 'TFNG', 
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
  },
];

// Correct answers for the test
const correctAnswers: string[] = [
  'TRUE', 'NOT GIVEN', 'FALSE', 'TRUE', // 1–4 TFNG
  'Evergreen tree', 'Natural pesticides', 'A powder', 'Overnight', 'Cake', 'Nitrogen', // 5–10 text
  '2000', 'Neem seeds', 'Water purification', // 11–13 text
  'clay', 'water', 'straw', 'cow manure', '950 degrees', '60 minutes', // 14–19 text
  'FALSE', 'NOT GIVEN', 'FALSE', 'NOT GIVEN', // 20–23 TFNG
  'C', 'B', 'A', // 24–26 mcq
  'vii', 'iv', 'vi', 'v', 'viii', 'iii', // 27–32 HeadingMatch
  'combustion engine', 'silent', 'battery', 'portable computers', // 33–36 text
  'FALSE', 'NOT GIVEN', 'TRUE', 'TRUE', // 37–40 TFNG
];



export default function ReadingTestPage({ testId = 1 }: { testId?: number }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  // State management
  const [currentPassage, setCurrentPassage] = useState(1);
  const [answers, setAnswers] = useState<string[]>(Array(40).fill(''));
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [started, setStarted] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentDatetime, setStudentDatetime] = useState('');
  const [submittingTest, setSubmittingTest] = useState(false);
  const [selRect, setSelRect] = useState<{ top: number; left: number } | null>(null);

  // Combine all questions for the test
  const testData = {
    title: 'IELTS Reading Test ${testId}',
    passage1: passages[1],
    passage2: passages[2],
    passage3: passages[3],
    questions: [...passage1Questions, ...passage2Questions, ...passage3Questions],
  };
// Timer logic: countdown and auto-submit when time runs out
    useEffect(() => {
      if (!started || timeLeft <= 0) {
        if (timeLeft <= 0 && started) {
          setShowSubmitDialog(true);
        }
        return;
      }
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowSubmitDialog(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [started, timeLeft]);

    // Timer display format
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }

  // Handle answer changes for a question
  const handleAnswerChange = (questionNumber: number, value: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionNumber - 1] = value; // Adjust for 0-based index
      return updated;
    });
  };

  // Calculate score and show result (used in a preliminary submit check)
  {/*const handleSubmit = () => {
    const trimmedAnswers = answers.map((a) => a.trim().toUpperCase());
    const correct = correctAnswers.map((a) => a.trim().toUpperCase());
    
    let score = 0;
    for (let i = 0; i < 40; i++) {
      if (trimmedAnswers[i] === correct[i]) score++;
    }
    
    let band = 0;
    if (score >= 39) band = 9.0;
    else if (score >= 37) band = 8.5;
    else if (score >= 35) band = 8.0;
    else if (score >= 33) band = 7.5;
    else if (score >= 30) band = 7.0;
    else if (score >= 27) band = 6.5;
    else if (score >= 23) band = 6.0;
    else if (score >= 19) band = 5.5;
    else if (score >= 15) band = 5.0;
    else if (score >= 12) band = 4.5;
    else if (score >= 10) band = 4.0;
    else if (score >= 8) band = 3.5;
    else if (score >= 6) band = 3.0;
    else if (score >= 4) band = 2.5;
    else band = 2.0;

    alert(`✅ Test completed!\nCorrect: ${score}/40\nBand Score: ${band.toFixed(1)}`);
  };*/}

  // Utility to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

  // Handle final submission with PDF generation
  const handleFinalSubmit = async () => {
    if (!studentName.trim() || !studentDatetime.trim()) {
      alert('Please fill in Full Name and Date/Time!');
      return;
    }

    // Validate datetime format
    const isValidDate = dayjs(studentDatetime, 'DD-MM-YYYY HH:mm', true).isValid();
    if (!isValidDate) {
      alert('Invalid Date/Time format! Please use DD-MM-YYYY HH:mm.');
      return;
    }

    try {
      setSubmittingTest(true);

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      doc.setFont('helvetica', 'normal');
      const margin = 40;
      const maxWidth = 515;
      let y = 40;

      // Load and add the CARA IELTS logo
      const logoUrl = '/images/CARA_IELTS_Logo.jpg';
      try {
        const logoBase64 = await loadImageAsBase64(logoUrl);
        // Add image to the top-right corner (adjust width/height as needed)
        doc.addImage(logoBase64, 'JPEG', 490, 5, 100, 100); // x: 490 (right side), y: 8 (top), width: 100, height: 100
      } catch (error) {
        console.error('Failed to load logo:', error);
      }

      // Use the dynamic test number
      const testTitle = `IELTS READING TEST ${testId}`;

      // Header
      doc.setFontSize(14);
      doc.text(testTitle, 290, y, { align: 'center' });
      y += 30;

      doc.setFontSize(12);
      doc.text(`Student: ${studentName}`, margin, y);
      y += 20;
      doc.text(`Date: ${studentDatetime}`, margin, y);
      y += 20;
      doc.line(margin, y, 555, y);
      y += 20;

      // Score calculation
      const sortedQs = testData.questions.sort((a, b) => a.number - b.number);
      let correctCount = 0;
      sortedQs.forEach((q) => {
        const userAns = (answers[q.number - 1] as string || '').trim().toLowerCase();
        const correct = correctAnswers[q.number - 1]?.trim().toLowerCase();
        if (userAns && correct && userAns === correct) correctCount++;
      });

      let band = 0;
      if (correctCount >= 39) band = 9.0;
      else if (correctCount >= 37) band = 8.5;
      else if (correctCount >= 35) band = 8.0;
      else if (correctCount >= 33) band = 7.5;
      else if (correctCount >= 30) band = 7.0;
      else if (correctCount >= 27) band = 6.5;
      else if (correctCount >= 23) band = 6.0;
      else if (correctCount >= 19) band = 5.5;
      else if (correctCount >= 15) band = 5.0;
      else if (correctCount >= 13) band = 4.5;
      else if (correctCount >= 10) band = 4.0;
      else if (correctCount >= 7) band = 3.5;
      else if (correctCount >= 5) band = 3.0;
      else band = 2.5;

      // Render answers
      sortedQs.forEach((q) => {
        const rawAnswer = answers[q.number - 1];
        const clean = (txt: string) => txt.replace(/^!['’]?\s*/, '').trim();
        const formattedAnswer = rawAnswer && typeof rawAnswer === 'string' && rawAnswer.trim() !== ''
          ? clean(rawAnswer)
          : '[No Answer]'; // Use [No Answer] for empty, null, or undefined answers

        const line = `${q.number}. ${formattedAnswer}`;
        const wrappedLines = doc.splitTextToSize(line, maxWidth);
        if (y + wrappedLines.length * 16 > 780) {
          doc.addPage();
          y = 40;
        }

        doc.text(wrappedLines, margin, y);
        y += wrappedLines.length * 16 + 6;
      });

      // Add watermark on every page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(200);
        doc.setFontSize(60);
      }

      doc.save(`Reading_${studentName.replace(/\s+/g, '_')}.pdf`);
      alert('✅ PDF download started!');
      router.push('/dashboard');
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('❌ Failed to submit test. Please try again.');
    } finally {
      setSubmittingTest(false);
    }
  };

  // Highlight functionality
  const highlight = (color: string) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);

    // Check if selection contains input elements (gap-fill)
    const commonAncestor = range.commonAncestorContainer;
    const containsInput = commonAncestor.nodeType === 1 &&
      (commonAncestor as Element).querySelector('input');
    if (containsInput) {
      sel.removeAllRanges();
      setSelRect(null);
      return;
    }

    // Check if the selected range is within a highlighted span
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === 3) parent = parent.parentElement!;
    let highlightedSpan: HTMLElement | null = null;
    if (parent.nodeType === 1 && (parent as Element).classList?.contains('highlighted')) { // Type guard for Element
    highlightedSpan = parent as HTMLElement;
    } else {
      let current: HTMLElement | null = parent as HTMLElement;
      while (current && current !== document.body) {
        if (current.classList?.contains('highlighted')) {
          highlightedSpan = current;
          break;
        }
        current = current.parentElement;
      }
    }

    if (highlightedSpan) {
      // Re-highlight: Change the color of the existing highlighted span
      highlightedSpan.style.backgroundColor = color;
    } else {
      // New highlight: Create a new span
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.className = 'highlighted';

      try {
        range.surroundContents(span);
      } catch {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
      }
    }

    sel.removeAllRanges();
    setSelRect(null);
  };

  // Unhighlight functionality
  const removeHighlight = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    let parent = range.commonAncestorContainer;
    if (parent.nodeType === 3) parent = parent.parentElement!;

    let highlightedSpan: HTMLElement | null = null;
    if (parent.nodeType === 1 && (parent as Element).classList?.contains('highlighted')) { // Type guard for Element
    highlightedSpan = parent as HTMLElement;
    } else {
      let current: HTMLElement | null = parent as HTMLElement;
      while (current && current !== document.body) {
        if (current.classList?.contains('highlighted')) {
          highlightedSpan = current;
          break;
        }
        current = current.parentElement;
      }
    }

    if (highlightedSpan) {
      const text = document.createTextNode(highlightedSpan.innerText);
      highlightedSpan.replaceWith(text);
    }

    sel.removeAllRanges();
    setSelRect(null);
  };

  const onMouseUp = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
      const r = sel.getRangeAt(0).getBoundingClientRect();
      setSelRect({ top: r.top, left: r.left });
    } else {
      setSelRect(null);
    }
  };

  // Toggle fullscreen mode
  const toggleFull = () => {
    if (!document.fullscreenElement) {
      rootRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Navigate to previous passage
  const handlePreviousPassage = () => {
    if (currentPassage > 1) {
      setCurrentPassage(currentPassage - 1);
      // Scroll to the top of the questions panel
      const questionsPanel = document.querySelector('.questions-panel');
      if (questionsPanel) {
        questionsPanel.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // Navigate to next passage
  const handleNextPassage = () => {
    if (currentPassage < 3) {
      setCurrentPassage(currentPassage + 1);
      // Scroll to the top of the questions panel
      const questionsPanel = document.querySelector('.questions-panel');
      if (questionsPanel) {
        questionsPanel.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // Determine which questions to display based on the current passage
  const displayedQuestions =
    currentPassage === 1 ? passage1Questions :
    currentPassage === 2 ? passage2Questions :
    passage3Questions;

  return (
    <div ref={rootRef} className="font-['Roboto'] flex flex-col w-full h-screen overflow-hidden bg-orange-50">
      {!started && <div className="absolute inset-0 backdrop-blur-sm z-10" />}

      {/* Start Dialog */}
      {showStartDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-20">
          <div className="bg-orange-50 p-8 rounded shadow-md text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to Start?</h2>
            <p className="text-lg">
              Click{' '}
              <span
                className="text-red-500 underline cursor-pointer"
                onClick={() => {
                  setStarted(true);
                  setShowStartDialog(false);
                }}
              >
                here
              </span>{' '}
              to start the test.
            </p>
          </div>
        </div>
      )}

      {/* Header with Timer and Controls */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-orange-50 border-b px-5 py-2 shadow">
        <h1 className="text-lg font-bold">IELTS Reading Test {testId}</h1>
        
        {/* Timer */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
          <ClockIcon className="w-6 h-6 text-orange-500" />
          <span className="text-lg font-semibold text-orange-500">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Fullscreen and Submit Buttons */}
        <div className="w-1/4 flex justify-end space-x-2">
          <button onClick={toggleFull} className="p-2" aria-label="Toggle fullscreen">
            <Expand className="w-5 h-5 text-gray-600" />
          </button>
          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={submittingTest}
            className="bg-amber-300 hover:bg-amber-400 text-white flex items-center gap-1"
          >
            {submittingTest ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <>
                Submit <SendHorizontal className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Highlight Toolbar */}
      {selRect && (
        <div
          className="highlight-toolbar absolute z-50 flex items-center gap-1 p-1 bg-white border rounded shadow"
          style={{
            top: selRect.top - window.scrollY - 40,
            left: selRect.left - window.scrollX,
          }}
        >
          {['yellow', 'lightgreen', 'pink', 'aqua', 'orange'].map((color) => (
            <button
              key={color}
              className="w-5 h-5 border"
              style={{ backgroundColor: color }}
              onClick={() => highlight(color)}
              aria-label={`Highlight text in ${color}`}
            />
          ))}
          <button
            className="w-6 h-6 rounded border flex items-center justify-center text-amber-700"
            onClick={removeHighlight}
            aria-label="Remove highlight"
          >
            <SquarePen size={20} />
          </button>
        </div>
      )}

      {/* Main Layout: Passage and Questions */}
      <div className="h-[calc(100vh-64px)] flex flex-grow overflow-hidden bg-white rounded shadow">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-0">
        {/* Passage Panel */}
        <ResizablePanel
          defaultSize={50}
          minSize={20}
          className="flex flex-col pr-0 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-10"
          onMouseUp={onMouseUp}
        >
          <div className="pt-4 flex-1 pb-10 overflow-auto text-justify whitespace-pre-line leading-relaxed tracking-wide px-4">
            {passages[currentPassage]
              .split('\n')
              .filter((line) => line.trim() !== '')
              .map((line, idx) => {
                const trimmedLine = line.trim();
                // Check if the line is a "READING PASSAGE" header (e.g., "READING PASSAGE 1")
                const isReadingPassageHeader = trimmedLine.startsWith('READING PASSAGE');
                // Check if the line is a passage title (e.g., "The Pesticide-Free Village")
                const isPassageTitle = trimmedLine === 'The Pesticide-Free Village' || 
                                      trimmedLine === 'Water Filter' || 
                                      trimmedLine === 'Putting the Brakes on Climate Change: Are Hydrogen Cars the Answer?';

                return (
                  <div key={idx}>
                    <p
                      className={`
                        ${isReadingPassageHeader ? 'text-left text-red-600 font-bold text-lg mb-4' : ''}
                        ${isPassageTitle ? 'text-center font-bold text-lg mb-4' : ''}
                        ${!isReadingPassageHeader && !isPassageTitle ? 'mb-4' : ''}
                      `}
                    >
                      {trimmedLine}
                    </p>
                    {/* Add image after the passage title for Passage 2 */}
                    {currentPassage === 2 && trimmedLine === 'Water Filter' && (
                      <div className="flex justify-center my-4">
                        <Image
                          src="/images/Reading_test1_passage2.jpg"
                          alt="SAMPLE WATER FILTER"
                          width={300}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                    )}
                    {/* Add image after the passage title for Passage 3 */}
                    {currentPassage === 3 && trimmedLine === 'Putting the Brakes on Climate Change: Are Hydrogen Cars the Answer?' && (
                      <div className="flex justify-center my-4">
                        <Image
                          src="/images/Reading_test1_passage3.jpg"
                          alt="A car with a fuel cell"
                          width={300}
                          height={200}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle className="relative group">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 transition-opacity">
              <MoveHorizontal className="w-6 h-6 inline-block text-gray-500" />
            </div>
          </ResizableHandle>

          {/* Questions Panel */}
          <ResizablePanel
          defaultSize={50}
          minSize={20}
          className="flex flex-col pr-0 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-10"
          onMouseUp={onMouseUp} // Add onMouseUp for highlight detection
          >
          <div className="pt-4 overflow-y-auto flex-1 px-6 min-h-full pb-10">
                  {displayedQuestions.map((q) => (
                    <div key={`question-${q.number}`}>
                    {/* Instructions */}
                    {currentPassage === 1 && q.number === 1 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Questions 1-4</h3>
                      <p className="mb-2">Do the following statements agree with the information given in the passage?</p>
                      <div className="overflow-x-auto">
                        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">TRUE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement agrees with the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">FALSE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement contradicts the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">NOT GIVEN</td>
                              <td className="border border-gray-300 px-4 py-2">if there is no information on this</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                    {/* Instructions for Questions 5-10 */}
                    {currentPassage === 1 && q.number === 5 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Questions 5-10</h3>
                          <p className="mb-2 text-sm">
                            Complete the notes below. Choose <span className="text-red-600 font-bold">NO MORE THAN TWO WORDS</span> from the passage for each answer.
                          </p>
                          <p className="font-bold mb-2 ml-6">Non-Pesticide-Management Programme</p>
                          <ul className="list-disc list-inside text-sm ml-2">
                            <li>Developed with the aid of SECURE</li>
                          </ul>
                        </div>
                  )}

                    {/* Instructions for Questions 11-13 */}
                    {currentPassage === 1 && q.number === 11 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Questions 11-13</h3>
                          <p className="mb-2 text-sm">
                            Choose<span className="text-red-600 font-bold"> NO MORE THAN TWO WORDS AND/OR A NUMBER 
                              </span> from the passage for each answer.
                          </p>
                        </div>
                  )}

                    {/* Instructions for Questions 14-19 */}
                    {currentPassage === 2 && q.number === 14 && (
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold mb-2">Questions 14-19</h3>
                          <p className="mb-2 text-sm">
                            Choose<span className="text-red-600 font-bold"> NO MORE THAN TWO WORDS AND/OR A NUMBER 
                              </span> from the passage for each answer.
                          </p>
                          <p className="font-bold italic">Write your answers in boxes 14-19 on your answer sheet.</p>
                        </div>
                  )}

                    {/* Instructions for Questions 20-23 */}
                    {currentPassage === 2 && q.number === 20 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Questions 20-23</h3>
                      <p className="mb-2 text-sm">Do the following statements agree with the information given in the passage?</p>
                      <div className="overflow-x-auto">
                        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">TRUE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement agrees with the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">FALSE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement contradicts the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">NOT GIVEN</td>
                              <td className="border border-gray-300 px-4 py-2">if there is no information on this</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                    {/* Instructions for Questions 24-26 */}
                    {currentPassage === 2 && q.number === 24 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Questions 24-26</h3>
                          <p className="mb-2 text-sm">Choose the correct letter, A, B, C or D.</p>
                          <p className="italic">Choose your answers in boxes 24-26 on your answer sheet.</p>
                        </div>
                  )}

                    {/* Instructions for Questions 24-26 */}
                    {currentPassage === 3 && q.number === 27 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Questions 27-32</h3>
                          <p className="mb-2 text-sm">Reading Passage 3 has seven paragraphs, A-G.</p>
                          <p className="mb-2 text-sm">Choose the correct heading for paragraphs A-F from the list of headings below.</p>
                          <p className="italic text-sm">Write the correct number, 
                            <strong className='text-red-600'> i-ix</strong>, 
                            in boxes <strong className='text-red-600'>27-32 </strong> 
                            on your answer sheet.</p>
                        </div>
                  )}

                    {/* Instructions for Questions 33-36 */}
                    {currentPassage === 3 && q.number === 33 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Questions 33-36</h3>
                          <p className="mb-2 text-sm">
                            Choose<span className="text-red-600 font-bold"> NO MORE THAN TWO WORDS AND/OR A NUMBER 
                              </span> from the passage for each answer.
                          </p>
                          <p className="italic text-sm">Write your answers in boxes
                            <strong className='text-red-600'> 33-36 </strong> 
                            on your answer sheet.</p>
                        </div>
                  )}

                  {/* Instructions for Questions 37-40 */}
                    {currentPassage === 3 && q.number === 37 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Questions 37-40</h3>
                      <p className="mb-2 text-sm">Do the following statements agree, with the information given in Reading Passage 3?</p>
                      <p className="mb-2 italic text-sm">In boxes 37-40 on your answer sheet, write</p>
                      <div className="overflow-x-auto">
                        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">TRUE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement agrees with the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">FALSE</td>
                              <td className="border border-gray-300 px-4 py-2">if the statement contradicts the information</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2 font-bold">NOT GIVEN</td>
                              <td className="border border-gray-300 px-4 py-2">if there is no information on this</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                    {/* Question Rendering */}
                    <div id={`question-${q.number}`} className="mb-5">
                    {/* TRUE/FLASE/NOT GIVEN*/}        
                    {q.type === 'TFNG' && (
                    <>
                      <p className="font-medium mb-2 text-sm">{q.number}. {q.question_text}</p>
                      <div className="space-y-2">
                        {q.options?.map((opt) => (
                          <label key={opt} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`q${q.number}`}
                              value={opt}
                              checked={answers[q.number - 1] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              aria-label={`Question ${q.number} option ${opt}`}
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                    {/* Gap-Fill Questions (Q5-10) */}
                    {(q.type === 'text' && q.number >= 5 && q.number <= 10) && (
                    <div className="text-sm">
                      {/* Question 5: Base structure */}
                      {q.number === 5 && (
                        <div className="flex items-center space-x-2">
                          <li className="ml-2">Based on the use of an</li>
                          <input
                            type="text"
                            className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                            placeholder="5"
                            value={answers[4] || ''} // q.number - 1 for 0-based index
                            onChange={(e) => handleAnswerChange(5, e.target.value)}
                            aria-label="Question 5 answer"
                          />
                        </div>
                      )}

                      {/* Question 6: Start of Neem section */}
                      {q.number === 6 && (
                        <div className="flex items-center space-x-2">
                          <li className="ml-2">Neem contains many</li>
                          <input
                            type="text"
                            className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                            placeholder="6"
                            value={answers[5] || ''}
                            onChange={(e) => handleAnswerChange(6, e.target.value)}
                            aria-label="Question 6 answer"
                          />
                          <span>that target plant-eating predators</span>
                        </div>
                      )}

                      {/* Neem subsection for Questions 7-10 */}
                      {q.number >= 7 && q.number <= 10 && (
                        <div className="ml-6">
                          {q.number === 7 && (
                            <>
                              <div className="mb-1">
                                <li className="ml-2">Neem:</li>
                              </div>
                              <div className="flex items-center space-x-2">
                                <li className="ml-6">Used as a pesticide</li>
                              </div>
                              <div className="flex items-center space-x-2">
                                <li className="ml-6">
                                  <input
                                    type="text"
                                    className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    placeholder="7"
                                    value={answers[6] || ''}
                                    onChange={(e) => handleAnswerChange(7, e.target.value)}
                                    aria-label="Question 7 answer"
                                  />
                                  <span> formed by grinding seeds</span>
                                </li>
                              </div>
                            </>
                          )}
                          {q.number === 8 && (
                            <div className="flex items-center space-x-2">
                              <li className="ml-6">
                                Left 
                                <input
                                  type="text"
                                  className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                  placeholder="8"
                                  value={answers[7] || ''}
                                  onChange={(e) => handleAnswerChange(8, e.target.value)}
                                  aria-label="Question 8 answer"
                                />
                                <span> to soak in water</span>
                              </li>
                            </div>
                          )}
                          {q.number === 9 && (
                            <>
                              <div className="flex items-center space-x-2">
                                <li className="ml-6">Sprayed regularly</li>
                              </div>
                              <div className="flex items-center space-x-2">
                                <li className="ml-6">Used as a pesticide and as a fertilizer</li>
                              </div>
                              <div className="flex items-center space-x-2">
                                <li className="ml-6">
                                  Added in
                                  <input
                                    type="text"
                                    className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    placeholder="9"
                                    value={answers[8] || ''}
                                    onChange={(e) => handleAnswerChange(9, e.target.value)}
                                    aria-label="Question 9 answer"
                                  />
                                  <span> form to soil</span>
                                </li>
                              </div>
                            </>
                          )}
                          {q.number === 10 && (
                            <div className="flex items-center space-x-2">
                              <li className="ml-6">
                                Contains a lot of
                                <input
                                  type="text"
                                  className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                                  placeholder="10"
                                  value={answers[9] || ''}
                                  onChange={(e) => handleAnswerChange(10, e.target.value)}
                                  aria-label="Question 10 answer"
                                />
                              </li>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Questions for Q11-13 */}
                  {(q.type === 'text' && q.number >= 11 && q.number <= 13) && (
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium">{q.number}. {q.question_text}</p>
                      <input
                        type="text"
                        className="text-sm border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder={String(q.number)}
                        value={answers[q.number - 1] || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        aria-label={`Question ${q.number} answer`}
                      />
                    </div>
                  )}

                  {/* Gap-Fill Questions (Q14-19) */}
                  {q.type === 'text' && q.number >= 14 && q.number <= 19 && (
                    <div className="text-sm space-y-1">
                      {/* Step-by-step guide subheading */}
                      {q.number === 14 && (
                        <p className="font-bold text-center">Step-by-step guide to making Flynn’s water filters</p>
                      )}

                      {/* Combined Question 14-15 */}
                      {q.number === 14 && (
                        <>
                          <div className="flex justify-center">
                            <p className="text-center">
                              Make the mixture for the filter from organic material (e.g. tea, coffee, rice),</p>
                          </div>
                          <div className="flex justify-center space-x-2">
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                              placeholder="14"
                              value={answers[13] || ''} // q.number - 1 for 0-based index
                              onChange={(e) => handleAnswerChange(14, e.target.value)}
                              aria-label="Question 14 answer"
                            />
                            and 
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                              placeholder="15"
                              value={answers[14] || ''} // Store Q15 answer in the next index
                              onChange={(e) => handleAnswerChange(15, e.target.value)}
                              aria-label="Question 15 answer"
                            />.
                          </div>
                          <div className="flex justify-center">
                            <ArrowDown className="w-6 h-6 text-blue-500 border border-blue-300 rounded-full p-0.5" />
                          </div>
                        </>
                      )}

                      {/* Combined Question 16-17 */}
                      {q.number === 16 && (
                        <>
                          <div className="flex justify-center">
                            <p className="text-center">
                              Shape into pots and place them in a fire made from
                            </p>
                          </div>
                          <div className="flex justify-center space-x-2">
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                              placeholder="16"
                              value={answers[15] || ''}
                              onChange={(e) => handleAnswerChange(16, e.target.value)}
                              aria-label="Question 16 answer"
                            />
                            and 
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                              placeholder="17"
                              value={answers[16] || ''}
                              onChange={(e) => handleAnswerChange(17, e.target.value)}
                              aria-label="Question 17 answer"
                            />.
                          </div>
                          <div className="flex justify-center">
                            <ArrowDown className="w-6 h-6 text-blue-500 border border-blue-300 rounded-full p-0.5" />
                          </div>
                        </>
                      )}

                      {/* Question 18 */}
                      {q.number === 18 && (
                        <>
                          <div className="flex justify-center">
                            <div className="flex items-center space-x-1 text-center">
                              Fuel the fire to reach a maximum heat of
                              <input
                                type="text"
                                className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                                placeholder="18"
                                value={answers[17] || ''}
                                onChange={(e) => handleAnswerChange(18, e.target.value)}
                                aria-label="Question 18 answer"
                              />
                              .
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <ArrowDown className="w-6 h-6 text-blue-500 border border-blue-300 rounded-full p-0.5" />
                          </div>
                        </>
                      )}

                      {/* Static Text: Remove the filters from the fire */}
                      {q.number === 19 && (
                        <>
                          <div className="flex justify-center">
                            <p className="text-center">Remove the filters from the fire</p>
                          </div>
                          <div className="flex justify-center">
                            <ArrowDown className="w-6 h-6 text-blue-500 border border-blue-300 rounded-full p-0.5" />
                          </div>
                          <div className="flex justify-center">
                            <div className="flex items-center space-x-1 text-center">
                              Bake the filters in the fire for a maximum period of
                              <input
                                type="text"
                                className="border border-gray-200 rounded-full w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                                placeholder="19"
                                value={answers[18] || ''}
                                onChange={(e) => handleAnswerChange(19, e.target.value)}
                                aria-label="Question 19 answer"
                              />
                              .
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Text Questions for Q33-36 */}
                  {q.type === 'text' && q.number >= 33 && q.number <= 36 && (
                    <div className="text-sm space-y-1">
                      {q.number === 33 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium">
                            {q.number}. In the late nineteenth century, the car industry invested in the development of the
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                              placeholder="33"
                              value={answers[32] || ''} // q.number - 1 for 0-based index
                              onChange={(e) => handleAnswerChange(33, e.target.value)}
                              aria-label="Question 33 answer"
                            />
                            , rather than fuel-cell technology.
                          </p>
                        </div>
                      )}
                      {q.number === 34 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium">
                            {q.number}. Ford engineers predict that they will eventually design an almost
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                              placeholder="34"
                              value={answers[33] || ''}
                              onChange={(e) => handleAnswerChange(34, e.target.value)}
                              aria-label="Question 34 answer"
                            />
                            car.
                          </p>
                        </div>
                      )}
                      {q.number === 35 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium">
                            {q.number}. While a fuel-cell lasts longer, some aspects of it are comparable to a
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                              placeholder="35"
                              value={answers[34] || ''}
                              onChange={(e) => handleAnswerChange(35, e.target.value)}
                              aria-label="Question 35 answer"
                            />
                            .
                          </p>
                        </div>
                      )}
                      {q.number === 36 && (
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium">
                            {q.number}. Fuel-cells can come in many sizes and can be used in power stations and in
                            <input
                              type="text"
                              className="border border-gray-200 rounded-full px-3 py-[1px] w-35 text-center focus:outline-none focus:ring-2 focus:ring-orange-300 mx-1"
                              placeholder="36"
                              value={answers[35] || ''}
                              onChange={(e) => handleAnswerChange(36, e.target.value)}
                              aria-label="Question 36 answer"
                            />
                            as well as in vehicles.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                    {/* MultipleChoice Questions */}
                    {q.type === 'mcq' && (
                      <>
                        <p className="text-sm font-medium mb-2">{q.number}. {q.question_text}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt) => (
                            <label key={opt} className="text-sm flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`q${q.number}`}
                                value={opt[0]}
                                checked={answers[q.number - 1] === opt[0]}
                                onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                                aria-label={`Question ${q.number} option ${opt}`}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* HeadingMatch Questions (Q27-32) */}
                    {q.type === 'HeadingMatch' && (
                      <div className="text-sm space-y-1">
                        {/* Display List of Headings in a Single-Column Table */}
                        {q.number === 27 && (
                          <div className="mb-4">
                            <p className="mb-2 font-bold">List of Headings</p>
                            <div className="overflow-x-auto">
                              <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                                <tbody>
                                  {q.options?.map((opt) => (
                                    <tr key={opt}>
                                      <td className="border border-gray-300 px-4 py-2">
                                        {opt}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Question with Dropdown */}
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-sm font-medium">{q.number}. {q.question_text}</p>
                          <select
                            className="border border-gray-200 rounded px-3 py-1 text-sm"
                            value={answers[q.number - 1] || ''}
                            onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                            aria-label={`Question ${q.number} select heading`}
                          >
                            <option value="">Select heading</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Passage Navigation Buttons (Fixed Above Question Navigation) */}
            <div className="fixed bottom-16 right-4 flex space-x-2 z-20">
              <button
                onClick={handlePreviousPassage}
                disabled={currentPassage === 1}
                className={`p-2 rounded-full border bg-white shadow-md 
                  ${currentPassage === 1 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-amber-100'}`}
                aria-label="Previous Passage"
              >
                <ChevronLeft className="w-6 h-6 text-amber-600" />
              </button>
              <button
                onClick={handleNextPassage}
                disabled={currentPassage === 3}
                className={`p-2 rounded-full border bg-white shadow-md 
                  ${currentPassage === 3 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-amber-100'}`}
                aria-label="Next Passage"
              >
                <ChevronRight className="w-6 h-6 text-amber-600" />
              </button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Question Navigation */}
      <div className="absolute inset-x-0 bottom-0 bg-orange-50 shadow border-t p-2 z-10 overflow-x-auto">
        <div className="max-w-[2000px] mx-auto flex justify-center space-x-1">
          {testData.questions.map((q) => {
            const passageOfQ = q.number <= 13 ? 1 : q.number <= 26 ? 2 : 3;
            return (
              <button
                key={q.number}
                onClick={() => {
                  setCurrentPassage(passageOfQ);
                  setTimeout(() => {
                    const el = document.getElementById(`question-${q.number}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }}
                className={`w-7 h-7 border rounded-full text-sm font-medium transition-all duration-150 ${
                  answers[q.number - 1]
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-100'
                }`}
                aria-label={`Jump to question ${q.number}`}
              >
                {q.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
      <div className="fixed inset-0 bg-amber-100 bg-opacity-80 flex items-center justify-center z-40">
        <div className="bg-white p-8 rounded-md shadow-md w-96 space-y-4">
          <h2 className="text-xl font-semibold text-center text-orange-500">Submit Your Test</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="student-name">
                Full Name
              </label>
              <input
                id="student-name"
                type="text"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                aria-required="true"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="test-datetime">
                Test Date & Time
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimeField
                  format="DD-MM-YYYY HH:mm"
                  value={studentDatetime ? dayjs(studentDatetime, 'DD-MM-YYYY HH:mm') : null}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid()) {
                      setStudentDatetime(newValue.format('DD-MM-YYYY HH:mm'));
                    }
                  }}
                  className="w-full"
                  slotProps={{
                    textField: {
                      id: 'test-datetime',
                      'aria-required': 'true',
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowSubmitDialog(false)}
              disabled={timeLeft <= 0} // Disable cancel when time is up
              aria-label="Cancel submission"
              className={timeLeft <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={submittingTest}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              aria-label="Submit test"
            >
              {submittingTest ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}