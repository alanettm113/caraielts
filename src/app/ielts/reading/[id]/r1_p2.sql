
UPDATE reading_tests
SET passage2 = $$The 2003 Heatwave

It was the summer, scientists now realise, when global warming at last made itself unmistakably felt...
(Full passage omitted here for brevity — assumed already stored in full)$$
WHERE id = '733305e0-4c0f-41eb-958b-c56391fdb00e';


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'e745df9b-8c3d-43d2-80f2-6c0ca4353aca',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    14,
    'YNNG',
    $$The average summer temperature in 2003 is almost 4 degrees higher than the average summer temperature of the past.$$,
    NULL,
    $$Yes$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '74d226df-2590-41e4-847b-52b697ffeade',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    15,
    'YNNG',
    $$Global warming is caused by human activities.$$,
    NULL,
    $$Yes$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'c3a1685a-bc97-4cae-9e9f-ff95ee161b24',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    16,
    'YNNG',
    $$Jones believes the temperature variation is within the normal range.$$,
    NULL,
    $$No$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '3944ca27-7972-40ed-893f-b0978bdbeaac',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    17,
    'YNNG',
    $$The temperature is measured twice a day in major cities.$$,
    NULL,
    $$Not Given$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '28354d6f-6d3b-4c85-bc84-d23d5962e05f',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    18,
    'YNNG',
    $$There were milder winters rather than hotter summers before 2003.$$,
    NULL,
    $$Yes$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'ed310ac6-4bc3-44cd-a5b3-46c180d088a4',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    19,
    'YNNG',
    $$Governments are building new high-altitude ski resorts.$$,
    NULL,
    $$Not Given$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '70052379-7ada-409c-911a-191cf5334e0c',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    20,
    'ShortAnswer',
    $$What are the other two hottest years in Britain besides 2003?$$,
    NULL,
    $$1976, 1995$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '1bf5580a-c169-469c-a00c-6eb9e384e889',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    21,
    'ShortAnswer',
    $$What will also influence government policies in the future like the hot summer in 2003?$$,
    NULL,
    $$2000 floods$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'd080e4fc-4f2a-4004-8a87-43686a84c392',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    22,
    'GapFill',
    $$The other two hottest years around the globe were _______.$$,
    NULL,
    $$1998 and 2002$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    '01983bff-215d-4876-a1bb-9fac621f385f',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    23,
    'GapFill',
    $$The ten hottest years on record all come after the year _______.$$,
    NULL,
    $$1990$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'e34b084f-ddf7-4727-a31d-7540104f71b5',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    24,
    'GapFill',
    $$This temperature data has been gathered since _______.$$,
    NULL,
    $$1856$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'e8ff1cf5-987b-43fd-b05a-32c86d0895a6',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    25,
    'GapFill',
    $$Thousands of people died in the country _______.$$,
    NULL,
    $$France$$,
    2,
    now()
);


INSERT INTO reading_questions (id, test_id, number, type, question_text, options, answer, passage_no, created_at)
VALUES (
    'c57c9f42-d7ad-4b90-8288-ec8e853111fb',
    '733305e0-4c0f-41eb-958b-c56391fdb00e',
    26,
    'MultipleChoice',
    $$Which one of the following can be best used as the title of this passage?$$,
    ARRAY['A', 'B', 'C', 'D'],
    $$D$$,
    2,
    now()
);
