Classification- Introduction, Decision tree construction principle, Splitting indices-
Information Gain, Gini index, Decision Tree- ID3, Decision tree construction with presorting-
SLIQ, Accuracy and error measures, evaluation

## Introduction to clustering, Clustering Paradigms, Partitioning Algorithm- PAM, Hierarchical

Clustering-DBSCAN, Categorical Clustering-ROCK

## Classification in data mining


### Classification in data mining can be stated as follows:

“For a database with a number of records and for a set of classes such that each record belongs to one of
the given classes, the problem of classification is to decide the class to which a given record belongs. “

- Here, we are concerned with a type of classification called supervised classification.
- In supervised classification, we have a training data set of records and for each record of this set, the
    respective class to which it belongs is also known.
- Using the training set, the classification process attempts to generate the descriptions of the classes,
    and these descriptions help to classify the unknown records.
- In addition to the training set, we can also have a test data set which is used to determine the
    effectiveness of a classification.

## What is a decision tree?

- A decision tree is a classification scheme which generates a tree and a set of rules, representing the model of
    different classes, from a given data set.
- The set of records available for developing classification methods is generally divided into two disjoint subsets
    a training set and a test set.
- The former is used for deriving the classifier, while the latter is used to measure the accuracy of the classifier.
- The accuracy of the classifier is determined by the percentage of the test examples that are correctly classified.
- We categorize the attributes of the records into two different types.
- Attributes whose domain is numerical are called the numerical attributes, and the attributes whose domain is
    not numerical are called the categorical attributes. There is one distinguished attribute called the class label.
- The goal of the classification is to build a concise model that can be used to predict the class of the records
    whose class label is not known.

## EXAMPLE 1:

Consider the following data sets the training data set and the test data set.




- The dataset has five attributes.
- There is a special attribute: the attribute class is the class label.
- The attributes, temp (temperature) and humidity are numerical attributes and the other attributes are categorical, that is, they
    cannot be ordered.
- Based on the training data set, we want to find a set of rules to know what values of outlook, temperature, humidity and wind,
    determine whether or not to play golf.

- Figure gives a sample decision tree for illustration.
- We have the following rules corresponding to the tree given in
    Figure.


RULE 1: If it is sunny and the humidity is not above 75%, then play.
RULE 2: If it is sunny and the humidity is above 75%, then do not play.
RULE 3: If it is overcast, then play.
RULE 4: If it is rainy and windy, then don't play.
RULE 5: If it is rainy and not windy, then play.


- Please note that this may not be the best set of rules that can be
    derived from the given set of training data.

## How is decision tree used for classification?


- The classification of an unknown input vector is done by
    traversing the tree from the root node to a leaf node.
- A record enters the tree at the root node.
- At the root, a test is applied to determine which child node the
    record will encounter next.
- This process is repeated until the record arrives at a leaf node.
- All the records that end up at a given leaf of the tree are
    classified in the same way.
- There is a unique path from the root to each leaf.
- The path is a rule which is used to classify the records.

- Using the decision tree in Example 1, carry out the classification for an
### unknown record with the values of the first four attributes as:

outlook=rain, temp=70, humidity=65 and windy= true
- We start from the root node to check the value of the attribute
    associated at the root node.
- This attribute is the splitting attribute at this node.
- Please note that for a decision tree, at every node there is an attribute
    associated with the node called the splitting attribute.
- In our example, outlook is the splitting attribute at root.
- Since for the given record, outlook=rain, we move to the right-most
    child node of the root.
- At this node, the splitting attribute is windy and we find that for the
    record we want classify, windy =true.
- Hence, we move to the left child node to conclude that the class label
    is "no play".

- Note that every path from root node to leaf nodes represents a rule.
- It may be noted that many different leaves of the tree may refer to the same class labels, but each leaf refers to a
    different rule.
- The accuracy of the classifier is determined by the percentage of the test data set that is correctly classified.
    Consider the following test data set




- We can see that for Rule 1 there are two records of the test data set satisfying outlook = sunny and humidity<=
    75, and only one of these is correctly classified as play. Thus, the accuracy of this rule is 0.5 (or 50%).
- Similarly, the accuracy of Rule 2 is also 0.5 (or 50%). The accuracy of Rule 3 is 0.66.

- A decision tree construction process is concerned with identifying the splitting attributes and splitting
    criteria at every level of the tree.
- There are several alternatives and the main aim of the decision tree construction process is to generate
    simple, comprehensible rules with high accuracy.
- Sometimes the classification efficiency of the tree can be improved by revising the tree through some
    processes like pruning and grafting. These processes are activated after the decision tree is built.

## ADVANTAGES AND SHORTCOMINGS OF DECISION TREE

CLASSIFICATIONS(Assignment Question)

- The major strengths of the decision tree methods are the following:
    - decision trees are able to generate understandable rules,
    - they are able to handle both numerical and the categorical attributes, and
    - they provide a clear indication of which fields are most important for prediction or classification

- Some of the weaknesses of the decision trees are:
    - Some decision trees can only deal with binary-valued target classes. Others are able to assign records to an arbitrary
    number of classes, but are error-prone when the number of training examples per class gets small. This can happen
    rather quickly in a tree with many levels and/or many branches per node.
    - The process of growing a decision tree is computationally expensive. At each node, each candidate splitting field is
    examined before its best split can be found.

## DECISION TREE CONSTRUCTION PRINCIPLE

## DEFINITION 1: SPLITTING ATTRIBUTE

- With every node of the decision tree, there is an associated attribute whose values determine the
    partitioning of the data set when the node is expanded.



## DEFINITION 2: SPLITTING CRITERION

- The qualifying condition on the splitting attribute for data set splitting at a node, is called the splitting
    criterion at that node. For a numeric attribute, the criterion can be an equation or an inequality. For a
    categorical attribute, it is a membership condition on a subset of values.

The construction of the decision tree involves the following three main phases.
1. Construction phase: The initial decision tree is constructed in this phase, based on
the entire training data set. It requires recursively partitioning the training set into
two, or more, sub-partitions using a splitting criteria, until a stopping criteria is met.

2. Pruning phase: The tree constructed in the previous phase may not result in the best
possible set of rules due to over-fitting. The pruning phase removes some of the
lower branches and nodes to improve its performance.

3. Processing the pruned tree to improve understandability.

Construction Phase – Generic Algorithm (Hunt’s method)
- Let the training data set be T with class-labels {C1, C2, ….., Ck}
- The tree is built by repeatedly partitioning the training data, using some criterion like the goodness of the split.
- The process is continued till all the records in a partition belong to the same class.
    1.   T is homogeneous: T contains cases all belonging to a single class C. The decision tree for T is a leaf
    identifying class Cj.


2.   T is not homogeneous: T contains cases that belong to a mixture of classes. A test is chosen, based on a
single attribute, that has one or more mutually exclusive outcomes {O1,O2,….,On}. T is partitioned into the
subsets T1, T2, T3..... Tn, where Ti contains all those cases in T that have the outcome Oi, of the chosen test.
The decision tree for T consists of a decision node identifying the test, and one branch for each possible
outcome. The same tree building method is applied recursively to each subset of training cases. Most often, n
is chosen to be 2 and hence, the algorithm generates a binary decision tree.


3.   T is trivial: T contains no cases. The decision tree T is a leaf, but the class to be associated with the leaf must
be determined from information other than T.

## Splitting Indices



- In this section, we shall study two different methods of determining the goodness of a
    split.
- One index is based on the information theory, that is, information gain based on
    entropy.
- The other one is derived from economics as measure of diversity. This is called the gini
    index.

## 1. ENTROPY


If we are given a probability distribution P = (p1, p2,….pn), then the information conveyed by this
distribution, also called the entropy of P, is
Entropy(P) = -[p1 log(p1) + p2 log(p2)+......+ pn log(pn.)]

## For example:

- if P is (0.5, 0.5), then Entropy(P) is 1;
- if P is (0.67, 0.33), then Entropy(P) is 0.92;
- if P is (1, 0), then Entropy(P) is 0.
    Note that the more uniform the probability distribution, the greater is its information.

- If a set of records T is partitioned into a set of disjoint exhaustive classes C1, C2...,… Cn, on the basis
    of the value of the class attribute, then the information needed to identify the class of an element of T
    is

## Info(T)= Entropy(P),


where P is the probability distribution of the partition C1, C2, based on their relative frequencies, i.e.,

Suppose that a data set has three distinct classes: C1, C2, and C3. In other words, the class attribute has
the domain consisting of {C1, C2, C3} and each category has 40, 30, 30 data, respectively. We
summarize this in Table.




The value of the entropy of the whole data set is

- If T is partitioned based on the value of the non-class attribute X, into sets T1, T2,.... Tn, then the
    information needed to identify the class of an element of T becomes the weighted average of the
    information to identify the class of the element of Ti, i.e., the weighted average of Info(Ti).

## DEFINITION: GAIN

- We define the information gain due to a split on attribute X as
    Gain(X,T) = Info(T) - Info(X, T)
- The information gain represents the difference between the information needed to identify an element
    of T and the information needed to identify an element of T after the value of attribute X is obtained.
- That is, the information gain due to attribute X.
- In the above example, splitting decreases the value of the entropy by 0.29. In other words, the gain is
    0.29.

## DEFINITION: GAIN RATIO




- In the above example, gain ratio = 0.29/0.80 = 0.3625

- Let us consider another splitting as given in Table 6.6.




- In this case, the value of the associated entropy is 1.075 and the gain is 0.015, gain ratio
    is 0.014.

- Thus, we can use this notion of gain to rank attributes and to build decision trees where,
    at each node, the attribute with greatest gain becomes the splitting attribute.

Consider the given dataset of playing tennis. Calculate the entropy, gain and gain ratio for all
the four attributes: outlook, temperature, humidity, and wind.

Information needed to identify the class of an element of entire dataset, T, using class label:


Attribute 1: outlook
  - It has three distinct values--sunny, overcast and rain, with 5, 4 and 5 records, respectively.
  - Among the 5 records which have outlook = sunny, 2 records are in the play class and 3 are in the no play class.
  - Thus, these five records have a distribution (3/5, 2/5).
  - Similarly, the distributions for overcast and rain are (1, 0) and (3/5, 2/5), respectively. Thus,

## Attribute 2: Humidity

- Since the no. of distinct values for this attribute is high, the no. of branches will also be high, which
    may cause overfitting.
- Therefore, we can categorize these values into two: high and low, with the value exceeding 75 as high
    humidity else low humidity.
- There are 9 records with high humidity, of which 4 are in the no play class and 5 are in the play class.
- Similarly, out of the 5 records of low humidity, 1 is in the no play class and the remaining 4 are in the
    play class.
- In such a situation, the gain is calculated as follows:

## 2. GINI INDEX

- One of the goodness measures can be related to measure of diversity.
- A high index of diversity indicates that the set contains an even distribution of classes; while a low index means
    that members of a single class predominates.
- The best splitter is the one that decreases the diversity of the record sets by the greatest amount, in other words,
    we want to maximize

Iterative Dichotomiser 3 (ID3) Algorithm
- ID3 stands for Iterative Dichotomiser 3 and is named such because the algorithm iteratively
    (repeatedly) dichotomizes(divides) features into two or more groups at each step.
- Invented by Ross Quinlan, ID3 uses a top-down greedy approach to build a decision tree.
- In simple words:
     - the top-down approach means that we start building the tree from the top and
     - the greedy approach means that at each iteration we select the best feature at the present moment
    to create a node.
- Most generally ID3 is only used for classification problems with nominal features only.
- By choosing the best characteristic at each node to partition the data depending on information gain, it
    recursively constructs a tree.
- The goal is to make the final subsets as homogeneous as possible.
- The procedure keeps going until a halting requirement is satisfied, like a minimum subset size or a
    maximum tree depth.

ID3 Steps

1.Calculate the Information Gain of each feature. Select the one that results in the most
significant information gain when used for splitting the data.
2.Split the dataset S into subsets using the feature for which the Information Gain is
maximum (Considering that all rows don’t belong to the same class)
3.Make a decision tree node using the feature with the maximum Information gain.
4.If all rows belong to the same class, make the current node as a leaf node with the class
as its label.
5.Repeat for the remaining features until we run out of all features, or the decision tree
has all leaf nodes.

## Example: Sample dataset on Covid-19 infection

Step1: Calculate the entropy of S

- From the total of 14 rows in our dataset S, there are 8 rows with the target value YES and 6 rows
    with the target value NO.

- The entropy of S is calculated as:

Step 2: Calculate the Information Gain for each feature

### 2.1. IG calculation for Fever:

- In this(Fever) feature there are 8 rows having value YES and 6 rows having value NO.
- In the 8 rows with YES for Fever, there are 6 rows having target value YES and 2 rows having target
    value NO.
- In the 6 rows with NO, there are 2 rows having target value YES and 4 rows having target value NO.

- Calculate the IG for the features “Cough” and “Breathing issues”.




- Since the feature Breathing issues have the highest Information Gain it is used to create the root node.
- Hence, after this initial step our tree looks like this:




- Next, from the remaining two unused features, namely, Fever and Cough, we decide which one is the
    best for the left branch of Breathing Issues.
- Since the left branch of Breathing Issues denotes YES, we will work with the subset of the original
    data i.e the set of 8 rows having YES as the value in the Breathing Issues column.

- Next, we calculate the IG for the features Fever and Cough using the subset Sʙʏ (Set Breathing
    Issues Yes) (and not the original dataset S.)



- IG of Fever is greater than that of Cough, so we select Fever as the left branch of Breathing Issues:
- Our tree now looks like this:

- Next, we find the feature with the maximum IG for the right branch of Breathing Issues.

- But, since there is only one unused feature left we have no other choice but to make it the
    right branch of the root node.

- So our tree now looks like this:

- There are no more unused features, so we stop here and jump to the final step of creating the leaf nodes.
- For the left leaf node of Fever, we see the subset of rows from the original data set that has Breathing Issues
    and Fever both values as YES.
- Since all the values in the target column are YES, we label the left leaf node as YES, but to make it more
    logical we label it Infected.
- Similarly, for the right node of Fever we see the subset of rows from the original data set that have Breathing
    Issues value as YES and Fever as NO.
- Here not all but most of the values are NO, hence NO or Not Infected becomes our right leaf node.
- Our tree, now, looks like this:

- We repeat the same process for the node Cough, however here both left and right leaves turn
    out to be the same i.e. NO or Not Infected as shown below:




- The right node of Breathing issues is as good as just a leaf node with class ‘Not infected’.
    This is one of the Drawbacks of ID3, it doesn’t do pruning.

- Pruning is a mechanism that reduces the size and complexity of a Decision tree by removing
    unnecessary nodes.

## Example 2: Build a decision tree using ID3 algorithm for the given training data in the table (Buy Computer

data), and predict the class of the following new example: age<=30, income=medium, student=yes, credit-
rating=fair.
age      income     student     Credit rating   Buys computer
<=30       high        no            fair             no
<=30       high        no         excellent           no
31…40       high        no            fair             yes
>40     medium        no            fair             yes
>40       low         yes           fair             yes
>40       low         yes        excellent           no
31…40       low         yes        excellent           yes
<=30     medium        no            fair             no
<=30       low         yes           fair             yes
>40     medium        yes           fair             yes
<=30     medium        yes        excellent           yes
31…40     medium        no         excellent           yes
31…40       high        yes           fair             yes
>40     medium        no         excellent           no

## Step 1: Calculation of entropy of whole dataset:


𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑆) = 𝐸(9, 5) = −9/14 log2(9/14) – 5/14 log2(5/14) = 0.94

## Step 2:


### 2.1. Consider the Age attribute

For Age, we have three values age<=30 (2 yes and 3 no), age 31..40 (4 yes and 0 no), and age > 40 (3 yes and
## 2 no)


## 5  2     2       3                    4      5       3         2

𝐸𝑛𝑡𝑟𝑜𝑝𝑦 𝑎𝑔𝑒 =         − log2   −                     +      0 +    −         −
## 14  5     5         3                 14     14         3         2

5log2                               5log2     5log2
## 5                                   5         5


= 5/14(0.9709) + 0 + 5/14(0.9709) = 0.6935

𝐺𝑎𝑖𝑛(𝑎𝑔𝑒) = 0.94 – 0.6935 = 0.2465

### 2.2. consider Income Attribute

For Income, we have three values incomehigh (2 yes and 2 no), incomemedium (4 yes and 2 no), and incomelow (3
yes 1 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦 𝑖𝑛𝑐𝑜𝑚𝑒

= 4/14(−2/4log2(2/4) − 2/4log2(2/4)) + 6/14 (−4/6log2(4/6) − 2/6log2(2/6
## 3          1

+ 4/14 (−          −
## 3          1

4log2      4log2
## 4          4

## 4       6           4

=    1 +      0.918 +     0.811
## 14      14          14


= 0.285714 + 0.393428 + 0.231714 = 0.9108

𝐺𝑎𝑖𝑛(𝑖𝑛𝑐𝑜𝑚𝑒) = 0.94 – 0.9108 = 0.0292

### 2.3. Next, consider Student Attribute


- For Student, we have two values studentyes (6 yes and 1 no) and studentno (3 yes 4 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦 𝑠𝑡𝑢𝑑𝑒𝑛𝑡

= 7/14(−6/7log2(6/7) − 1/7log2(1/7)) + 7/14(−3/7log2(3/7) − 4/7log2(4/7)

= 7/14(0.5916) + 7/14(0.9852)

= 0.2958 + 0.4926 = 0.7884

𝐺𝑎𝑖𝑛 (𝑠𝑡𝑢𝑑𝑒𝑛𝑡) = 0.94 – 0.7884 = 0.1516

### 2.4. consider Credit_Rating Attribute


- For Credit_Rating we have two values credit_ratingfair (6 yes and 2 no) and
    credit_ratingexcellent (3 yes 3 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦 𝑐𝑟𝑒𝑑𝑖𝑡𝑟𝑎𝑡𝑖𝑛𝑔



= 8/14(0.8112) + 6/14(1)

= 0.4635 + 0.4285 = 0.8920

𝐺𝑎𝑖𝑛(𝑐𝑟𝑒𝑑𝑖𝑡_𝑟𝑎𝑡𝑖𝑛𝑔) = 0.94 – 0.8920 = 0.479

Since Age has the highest Information Gain we start splitting the dataset using the age attribute.




Decision Tree after step 1

Since all records under the branch age 31..40 are all of the class, Yes, we can replace the leaf with Class=Yes




Decision Tree after step 1_1

Now build the decision tree for the left subtree

- For branch age<=30 we still have attributes income, student, and credit_rating. Which one should
    be used to split the partition?

- The mutual information is

𝐸(𝑆𝑎𝑔𝑒 <= 30) = 𝐸(2,3) = −2/5 log2(2/5) – 3/5 log2(3/5) = 0.97

- For Income, we have three values incomehigh (0 yes and 2 no), incomemedium (1 yes and 1 no) and
    incomelow (1 yes and 0 no)
## 2    2      1         1             1

𝐸𝑛𝑡𝑟𝑜𝑝𝑦 𝑖𝑛𝑐𝑜𝑚𝑒 =        +   −         −              +     0
## 5 0   5   2log2 1   2log2 1          5

## 2         2

= 2/5 (1) = 0.4

𝐺𝑎𝑖𝑛(𝑖𝑛𝑐𝑜𝑚𝑒) = 0.97 – 0.4 = 0.57

- For Student, we have two values studentyes (2 yes and 0 no) and studentno (0 yes 3 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑠𝑡𝑢𝑑𝑒𝑛𝑡) = 2/5(0) + 3/5(0) = 0

𝐺𝑎𝑖𝑛 (𝑠𝑡𝑢𝑑𝑒𝑛𝑡) = 0.97 – 0 = 0.97

- We can then safely split on attribute student without checking the other attributes since the information
    gain is maximized.

- Since these two new branches are from distinct classes, we make them into leaf nodes with their
## respective class as label:

Now build the decision tree for right left subtree
- The mutual information is

𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑆𝑎𝑔𝑒 > 40) = 𝐼(3,2) = −3/5 log2(3/5) – 2/5 log2(2/5) = 0.97

- For Income, we have two values incomemedium (2 yes and 1 no) and incomelow (1 yes and 1 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑖𝑛𝑐𝑜𝑚𝑒) = 3/5(−2/3log2(2/3) − 1/3log2(1/3) ) + 2/5(−1/2log2(1/2) − 1/2log2(1/2) )

= 3/5(0.9182) + 2/5 (1) = 0.55 + 0. 4 = 0.95

𝐺𝑎𝑖𝑛(𝑖𝑛𝑐𝑜𝑚𝑒) = 0.97 – 0.95 = 0.02

- For Student, we have two values studentyes (2 yes and 1 no) and studentno (1 yes and 1 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑠𝑡𝑢𝑑𝑒𝑛𝑡) = 3/5(−2/3log2(2/3) − 1/3log2(1/3)) + 2/5(−1/2log2(1/2) − 1/2log2(1/2)) = 0.95

𝐺𝑎𝑖𝑛 (𝑠𝑡𝑢𝑑𝑒𝑛𝑡) = 0.97 – 0.95 = 0.02

- For Credit_Rating, we have two values credit_ratingfair (3 yes and 0 no) and credit_ratingexcellent (0 yes and 2 no)

𝐸𝑛𝑡𝑟𝑜𝑝𝑦(𝑐𝑟𝑒𝑑𝑖𝑡_𝑟𝑎𝑡𝑖𝑛𝑔) = 0
𝐺𝑎𝑖𝑛(𝑐𝑟𝑒𝑑𝑖𝑡_𝑟𝑎𝑡𝑖𝑛𝑔) = 0.97 – 0 = 0.97

- We then split based on credit_rating.
- These splits give partitions each with records from the same class.
- We just need to make these into leaf nodes with their class label attached:

- New example: age<=30, income=medium, student=yes, credit-rating=fair

- Follow branch(age<=30) then student=yes we predict Class=yes

- Buys_computer = yes

Accuracy and error measures
- Accuracy and error measures are fundamental for evaluating the performance of a classification model.
- These measures help assess how well the model predicts the class labels of the data instances.
## Key measures:


1. Accuracy: Accuracy is one of the most straightforward measures and represents the proportion of
### correctly classified instances among the total instances. It is calculated as:

𝐴𝑐𝑐𝑢𝑟𝑎𝑐𝑦 = 𝑁𝑢𝑚𝑏𝑒𝑟 𝑜𝑓 𝐶𝑜𝑟𝑟𝑒𝑐𝑡 𝑃𝑟𝑒𝑑𝑖𝑐𝑡𝑖𝑜𝑛𝑠/𝑇𝑜𝑡𝑎𝑙 𝑁𝑢𝑚𝑏𝑒𝑟 𝑜𝑓 𝑃𝑟𝑒𝑑𝑖𝑐𝑡𝑖𝑜𝑛𝑠


2. Error Rate (Misclassification Rate): The error rate is the complement of accuracy and represents the
### proportion of incorrectly classified instances. It is calculated as:

## 𝐸𝑟𝑟𝑜𝑟 𝑅𝑎𝑡𝑒 = 1 − 𝐴𝑐𝑐𝑢𝑟𝑎𝑐𝑦

## Key Terms


- True Positive (TP): The model correctly identifies positive instances.

- True Negative (TN): The model correctly identifies negative instances.

- False Positive (FP): The model incorrectly identifies negative instances as positive.

- False Negative (FN): The model incorrectly identifies positive instances as negative.

3.   Precision: Precision focuses on the accuracy of positive predictions. It measures the proportion of true positive
predictions among all positive predictions. Precision is important when the cost of false positives is high. It is
## calculated as:

𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛 = 𝑇𝑟𝑢𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠/ (𝑇𝑟𝑢𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠 + 𝐹𝑎𝑙𝑠𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠)
4.       Recall (Sensitivity): Recall measures the ability of the classifier to identify all relevant instances, or the
proportion of true positive instances that were correctly classified. It is calculated as:
𝑅𝑒𝑐𝑎𝑙𝑙 = 𝑇𝑟𝑢𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠/(𝑇𝑟𝑢𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠 + 𝐹𝑎𝑙𝑠𝑒 𝑁𝑒𝑔𝑎𝑡𝑖𝑣𝑒𝑠)
5.   F1 Score: The F1 score is the harmonic mean of precision and recall. It provides a balance between precision
and recall. It is calculated as
𝐹1 = 2 × (𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛 + 𝑅𝑒𝑐𝑎𝑙𝑙)/(𝑃𝑟𝑒𝑐𝑖𝑠𝑖𝑜𝑛 × 𝑅𝑒𝑐𝑎𝑙𝑙)
6. Specificity: Specificity measures the proportion of true negatives that were correctly classified. It is calculated as:
𝑆𝑝𝑒𝑐𝑖𝑓𝑖𝑐𝑖𝑡𝑦 = 𝑇𝑟𝑢𝑒 𝑁𝑒𝑔𝑎𝑡𝑖𝑣𝑒𝑠/(𝑇𝑟𝑢𝑒 𝑁𝑒𝑔𝑎𝑡𝑖𝑣𝑒𝑠 + 𝐹𝑎𝑙𝑠𝑒 𝑃𝑜𝑠𝑖𝑡𝑖𝑣𝑒𝑠)

7.   ROC Curve (Receiver Operating Characteristic Curve): The ROC curve is a graphical representation of the
true positive rate (TPR) against the false positive rate (FPR) at various threshold settings. It helps to visualize the
performance of a classification model across different thresholds.

8. Area Under the ROC Curve (AUC-ROC): AUC-ROC provides an aggregate measure of the classifier's
performance across all possible thresholds. It quantifies the model's ability to distinguish between classes.

- Consider a dataset with a 1:100 minority to majority ratio, with 100 minority examples and 10,000
    majority class examples. A model makes predictions and predicts 120 examples as belonging to the
    minority class, 90 of which are correct, and 30 of which are incorrect.
- The precision for this model is calculated as:
    Precision = TruePositives / (TruePositives + FalsePositives)
    Precision = 90 / (90 + 30)
    Precision = 90 / 120
    Precision = 0.75
- Consider the same dataset, where a model predicts 50 examples belonging to the minority class, 45 of
    which are true positives and five of which are false positives.
- We can calculate the precision for this model as follows:
    Precision = TruePositives / (TruePositives + FalsePositives)
    Precision = 45 / (45 + 5)
    Precision = 45 / 50
    Precision = 0.90

- Consider a dataset with 1:100 minority to majority ratio, with 100 minority examples and 10,000
    majority class examples. A model makes predictions and predicts 90 of the positive class predictions
    correctly and 10 incorrectly.
- We can calculate the recall for this model as follows:
    Recall = TruePositives / (TruePositives + FalseNegatives)
    Recall = 90 / (90 + 10)
    Recall = 90 / 100
    Recall = 0.9

Decision tree construction with presorting- SLIQ


- SLIQ is a decision tree classifier that can handle both numeric and categorical attributes.
- SLIQ uses a pre-sorting technique in the tree-growth phase to reduce the cost of evaluating numeric
    attributes.
- This sorting procedure is integrated with a breadth-first tree growing strategy to enable SLIQ to
    classify disk-resident datasets.
- In addition, SLIQ uses a fast subsetting algorithm for determining splits for categorical attributes.
    SLIQ also uses a new tree-pruning algorithm based on the Minimum Description Length principle.
- This algorithm is inexpensive, and results in compact and accurate trees.
- The combination of these techniques enables SLIQ to scale for large data sets and classify data sets
    with a large number of classes, attributes, and examples.

Step 1: Pre-Sorting and Breadth-First Growth

- Create a separate list for each attribute of the training data.
- Additionally, a separate list, called class list, is created for the class labels attached to the examples.
- An entry in an attribute list has two fields: one contains an attribute value, the other an index into the class list.
- An entry of the class list also has two fields: one contains a class label, the other a reference to a leaf node of the
    decision tree.
- The ith entry of the class list corresponds to the ith example in the training data.
- Each leaf node of the decision tree represents a partition of the training data, the partition being defined by the
    conjunction of the predicates on the path from the node to the root.
- Thus, the class list can at any time identify the partition .to which an example belongs.
- Initially, the leaf reference fields of all the entries of the class list are set to point to the root of the decision tree.
- Then a pass is made over the training data, distributing values of the attributes for each example across all the
    lists.
- Each attribute value is also tagged with the corresponding class list index.
- The attribute lists for the numeric features are then sorted independently.

## Clustering - Introduction


- Clustering is a useful technique for the discovery of data distribution and patterns in the underlying
    data.
- The basic principle of clustering hinges on a concept of distance metric or similarity metric.

## CLUSTERING PARADIGMS

- There are two main approaches to clustering-
     - hierarchical clustering and
     - partitioning clustering.
- Besides, clustering algorithms differ among themselves in their ability to handle different types of
    attributes, numeric and categorical, in accuracy of clustering, and in their ability to handle disk-
    resident data.

## HIERARCHICAL VS PARTITIONING CLUSTERING



## PARTITIONING CLUSTERING

- The partition clustering techniques partition the database into a predefined number of clusters.
- They attempt to determine k partitions that optimize a certain criterion function.
- The partition clustering algorithms are of two types: k-means algorithms and k-medoid algorithms.
- Another type of algorithms can be k-mode algorithms.
    HIERARCHICAL CLUSTERING
- The hierarchical clustering techniques do a sequence of partitions, in which each partition is nested
    into the next partition in the sequence.
- It creates a hierarchy of clusters from small to big or big to small.
- The hierarchical techniques, are of two types-agglomerative and divisive clustering techniques.

- Agglomerative clustering techniques start with as many clusters as there are records, with each
    cluster having only one record.
- Then pairs of clusters are successively merged until the numbers of clusters reduces to k.
- At each stage, the pairs of the clusters that are merged are the ones nearest to each other.
- If the merging is continued, it terminates in a hierarchy of clusters which is built with just a single
    cluster containing all the records, at the top of the hierarchy.
- Divisive clustering techniques take the opposite approach from agglomerative techniques.
- This starts with all the records in one cluster, and then try to split that cluster into small pieces.

## NUMERIC VS CATEGORICAL CLUSTERING


- Clustering can be performed on both numerical data and categorical data.
- For the clustering of numerical data, the inherent geometric properties can be used to define the
    distances between the points.
- But for clustering of categorical data, such a criterion does not exist and many data sets also consist of
    categorical attributes, on which distance functions are not naturally defined.
- Recently, the problem of clustering categorical data has attracted interest. As an example, consider the
    MUSHROOM data set in the popular UCI machine-learning repository. Each tuple in the data set
    describes a sample of gilled mushrooms using twenty-two categorical attributes. For instance, the cap
    colour attribute can take values from the domain (brown, buff, cinnamon, gray, green, pink, purple,
    red, white, yellow). It is hard to reason that one colour is less than another colour in a way similar to
    real numbers.
- It is also hard to determine an ordering or to quantify the dissimilarity among such attributes.

## PARTITIONING ALGORITHMS

- Partitioning algorithms construct partitions of a database of N objects into a set of k clusters.
- The construction involves determining the optimal partition with respect to an objective function.
- The partitioning clustering algorithm usually adopts the Iterative Optimization paradigm.
- It starts with an initial partition and uses an iterative control strategy.
- It tries swapping data points to see if such a swapping improves the quality of clustering.
- When swapping does not yield any improvements in clustering, it finds a locally optimal partition.
- This quality of clustering is very sensitive to the initially selected partition.

- There are the two main categories of partitioning algorithms. They are
    (i) k-means algorithms, where each cluster is represented by the center of gravity of the
    cluster.
    (ii) k-medoid algorithms, where each cluster is represented by one of the objects of the
    cluster located near the center.
    Most of special clustering algorithms designed for data mining are k-medoid algorithms.

## K Means Clustering


- K-Means Clustering is an Unsupervised Machine Learning algorithm, which groups the unlabeled
    dataset into different clusters.
- K means clustering, assigns data points to one of the K clusters depending on their distance from the
    center of the clusters.
- It starts by randomly assigning the clusters centroid in the space.
- Then each data point assign to one of the cluster based on its distance from centroid of the cluster.
- After assigning each point to one of the cluster, new cluster centroids are assigned.
- This process runs iteratively until it finds good cluster.

## Example 1:

Cluster the following eight points (with (x, y) representing locations) into three clusters:
A1(2, 10), A2(2, 5), A3(8, 4), A4(5, 8), A5(7, 5), A6(6, 4), A7(1, 2), A8(4, 9)

## Example 2:

Use K-Means Algorithm to create two clusters-

K-Medoids clustering/Partitioning Around Medoid (PAM)

- Medoid: A Medoid is a point in the cluster from which the sum of distances to other data points is
    minimal.
    (or)
- Medoid is a point in the cluster from which dissimilarities with all the other points in the clusters are
    minimal.
- Instead of centroids as reference points in K-Means algorithms, the K-Medoids algorithm takes a
    Medoid as a reference point.
- There are three types of algorithms for K-Medoids Clustering:

## 1. PAM (Partitioning Around Clustering)

## 2. CLARA (Clustering Large Applications)

## 3. CLARANS (Randomized Clustering Large Applications)

## PAM Algorithm:

## Given the value of k and unlabelled data:

1.Choose k number of random points from the data and assign these k points to k number of
clusters. These are the initial medoids.
2.For all the remaining data points, calculate the distance from each medoid and assign it to the
cluster with the nearest medoid.
3.Calculate the total cost (Sum of all the distances from all the data points to the medoids).
4.Select a random point as the new medoid and swap it with the previous medoid. Repeat 2 and
3 steps.
5.If the total cost of the new medoid is less than that of the previous medoid, make the new
medoid permanent and repeat step 4.
6.If the total cost of the new medoid is greater than the cost of the previous medoid, undo the
swap and repeat step 4.
7.The repetitions have to continue until no change is encountered with new medoids to classify
data points.

### Perform K medoids clustering with k =2, on the given dataset:

x       y
## 0       5       4

## 1       7       7

## 2       1       3

## 3       8       6

## 4       4       9


## Steps:


## 1. Let initial medoids be M1(1, 3) and M2(4, 9)

2.Calculation of distances
Manhattan Distance: |x1 - x2| + |y1 - y2|

x      y       From        From
M1(1, 3)    M2(4, 9)
## 0     5      4          5          6

## 1     7      7         10          5

## 2     1      3          -          -

## 3     8      6         10          7

## 4     4      9          -          -




## Step 3:

## Cluster 1: 0, 2

## Cluster 2: 1, 3, 4


Total cost: (5) + (5 + 7) = 17

Step 4: Select a new random medoid: (5, 4)
X         Y       From       From
M1(5, 4)   M2(4, 9)
## 0         5        4             -      -

## 1         7        7         5          5

## 2         1        3         5          9

## 3         8        6         5          7

## 4         4        9             -      -


## Step 5:


## Cluster 1: 0, 2, 3

## Cluster 2: 1,4


Calculation of total cost: (5 + 5) + 5 = 15
Less than the previous cost
Therefore, new medoid: (5, 4).

Step 6: Select new random medoid: (7, 7)

x        y        From       From
M1(5, 4)   M2(7, 7)
## 0         5        4          -          -

## 1         7        7          -          -

## 2         1        3          5         10

## 3         8        6          5          2

## 4         4        9          6          5


## Step 7:

## Cluster 1: 0, 2

## Cluster 2: 1, 3, 4


Calculation of total cost: (5) + (2 + 5) = 12
Less than the previous cost
Therefore, New medoid: (7, 7).

Step 7: Select new random medoid: (8, 6)
x   y    From       From
M1(7, 7)   M2(8, 6)
## 0   5   4      5          5

## 1   7   7      -          -

## 2   1   3     10         10

## Step 8:                                           3   8   6      -          -

## 4   4   9      5          7

## Cluster 1: 1, 4

## Cluster 2: 0, 2, 3

Calculation of total cost:(5) + (5 + 10) = 20
Greater than the previous cost
UNDO
Hence, the final medoids: M1(5, 4) and M2(7, 7)
Cluster 1: 0, 2
Cluster 2: 1, 3, 4
Total cost: 12

Perform K medoids clustering with k =2, on the given dataset with initial medoids as points A10 and A6


## Point        Coordinates

## A1            (2, 6)

## A2            (3, 8)

## A3            (4, 7)

## A4            (6, 2)

## A5            (6, 4)

## A6            (7, 3)

## A7            (7,4)

## A8            (8, 5)

## A9            (7, 6)

## A10            (3, 4)

Step 1: Calculate the distance between each data point and the medoids using the Manhattan distance measure.

## Distance     Distance

## Assigned

Point    Coordinates   From M1      from M2
Cluster
(3,4)        (7,3)
A1         (2, 6)         3            8        Cluster 1
A2         (3, 8)         4            9        Cluster 1   The clusters made with medoids (3, 4) and (7, 3) are
### A3         (4, 7)         4            7        Cluster 1   as follows:

## A4         (6, 2)         5            2        Cluster 2

## A5         (6, 4)         3            2        Cluster 2

                                                             - Points in cluster1= {A1, A2, A3, A10}
    A6         (7, 3)         5            0        Cluster 2
                                                             - Points in cluster 2= {A4, A5, A6, A7, A8, A9}
    A7         (7,4)          4            1        Cluster 2
    A8         (8, 5)         6            3        Cluster 2
## The cost for the current cluster will be:

## A9         (7, 6)         6            3        Cluster 2

3+4+4+2+2+0+1+3+3+0 = 22.
A10         (3, 4)         0            5        Cluster 1

Iteration 2: Select another non-medoid point (7, 4) and make it a temporary medoid for the second cluster. Hence,
M1 = (3, 4)
M2 = (7, 4)
Calculate the distance between all the data points and the current medoids.
Distance Distance
Assigned
Point    Coordinates From     from M2
Cluster
M1 (3,4) (7,4)
A1        (2, 6)        3           7        Cluster 1
A2        (3, 8)        4           8        Cluster 1
A3        (4, 7)        4           6        Cluster 1
A4        (6, 2)        5           3        Cluster 2
A5        (6, 4)        3           1        Cluster 2
A6        (7, 3)        5           1        Cluster 2
A7        (7,4)         4           0        Cluster 2
A8        (8, 5)        6           2        Cluster 2
A9        (7, 6)        6           2        Cluster 2
A10        (3, 4)        0           4        Cluster 1

- The data points haven’t changed in the clusters after changing the medoids.

- Hence, clusters are:
    Points in cluster1:{(2, 6), (3, 8), (4, 7), (3, 4)}
    Points in cluster 2:{(7,4), (6,2), (6, 4), (7,3), (8,5), (7,6)}

- Calculate the cost for each cluster and find their sum. The total cost this time will be
    3+4+4+3+1+1+0+2+2+0=20.

- The current cost is less than the cost calculated in the previous iteration. Hence, we will make the
    swap permanent and make (7,4) the medoid for cluster 2.

- If the cost this time was greater than the previous cost i.e. 22, we would have to revert the change.

- New medoids after this iteration are (3, 4) and (7, 4) with no change in the clusters.

## Iteration 3

Again change the medoid of cluster 2 to (6, 4).
Hence, the new medoids for the clusters are M1=(3, 4) and M2= (6, 4 ).
Calculate the distance between the data points and the above medoids to find the new cluster.
Distance From Distance      Assigned
Point          Coordinates
M1 (3,4)      from M2 (6,4) Cluster
A1            (2, 6)           3             6          Cluster 1
A2            (3, 8)           4             7          Cluster 1
A3            (4, 7)           4             5          Cluster 1
A4            (6, 2)           5             2          Cluster 2
A5            (6, 4)           3             0          Cluster 2
A6            (7, 3)           5             2          Cluster 2
A7            (7,4)            4             1          Cluster 2
A8            (8, 5)           6             3          Cluster 2
A9            (7, 6)           6             3          Cluster 2
A10           (3, 4)           0             3          Cluster 1

- Again, the clusters haven’t changed.

- Hence, clusters are:
    Points in cluster 1:{(2, 6), (3, 8), (4, 7), (3, 4)}
    Points in cluster 2:{(7,4), (6,2), (6, 4), (7,3), (8,5), (7,6)}

- Now, let us again calculate the cost for each cluster and find their sum.

- The total cost this time will be 3+4+4+2+0+2+1+3+3+0=22.

- The current cost is 22 which is greater than the cost in the previous iteration i.e. 20.

- Hence, we will revert the change and the point (7, 4) will again be made the medoid for cluster 2.

- So, the clusters after this iteration will be:

cluster1 = {(2, 6), (3, 8), (4, 7), (3, 4)} and
cluster 2 = {(7,4), (6,2), (6, 4), (7,3), (8,5), (7,6)}

- The medoids are (3,4) and (7,4).

## Hierarchical Clustering


- In this algorithm, we develop the hierarchy of clusters in the form of a tree, and this tree-shaped structure
    is known as the dendrogram.
- The hierarchical clustering technique has two approaches:

1. Agglomerative: Agglomerative is a bottom-up approach, in which the algorithm starts with taking all
data points as single clusters and merging them until one cluster is left.

2. Divisive: Divisive algorithm is the reverse of the agglomerative algorithm as it is a top-down approach.

Agglomerative Hierarchical clustering


- To group the datasets into clusters, it follows the bottom-up approach.
- It means, this algorithm considers each dataset as a single cluster at the beginning, and then start
    combining the closest pair of clusters together.
- It does this until all the clusters are merged into a single cluster that contains all the datasets.
- This hierarchy of clusters is represented in the form of the dendrogram.

Working of Agglomerative Hierarchical clustering
Step-1: Create each data point as a single cluster. Let's say there are N data points, so the number of
clusters will also be N.




Step-2: Take two closest data points or clusters and merge them to form one cluster. So, there will now
be N-1 clusters.

Step-3: Again, take the two closest clusters and merge them together to form one cluster. There will be
N-2 clusters.




Step-4: Repeat Step 3 until only one cluster left. So, we will get the following clusters. Consider the
## below images:





Step-5: Once all the clusters are combined into one big cluster, develop the dendrogram to divide the
clusters as per the problem.

Measure for the distance between two clusters
- These measures are called Linkage methods. Some of the popular linkage methods are
## given below:


1. Single Linkage: It is the Shortest Distance between the closest points of the clusters.

2. Complete Linkage: It is the farthest distance between the two points of two different clusters.




3. Centroid Linkage: It is the linkage method in which the distance between the centroid of the clusters
is calculated.

Woking of Dendrogram in Hierarchical clustering
- The dendrogram is a tree-like structure that is mainly used to store each step as a memory that the HC
    algorithm performs.
- In the dendrogram plot, the Y-axis shows the Euclidean distances between the data points, and the x-
    axis shows all the data points of the given dataset.
- The working of the dendrogram can be explained using the below diagram:

- In the above diagram, the left part is showing how clusters are
    created in agglomerative clustering, and the right part is showing
    the corresponding dendrogram.
- As we have discussed above, firstly, the datapoints P2 and P3
    combine together and form a cluster, correspondingly a
    dendrogram is created, which connects P2 and P3 with a
    rectangular shape. The hight is decided according to the
    Euclidean distance between the data points.
- In the next step, P5 and P6 form a cluster, and the corresponding
    dendrogram is created. It is higher than of previous, as the
    Euclidean distance between P5 and P6 is a little bit greater than
    the P2 and P3.
- Again, two new dendrograms are created that combine P1, P2,
    and P3 in one dendrogram, and P4, P5, and P6, in another
    dendrogram.
- At last, the final dendrogram is created that combines all the data
    points together.
- We can cut the dendrogram tree structure at any level as per our
    requirement.

Find the clusters using a single linkage and complete linkage technique. Use Euclidean distance and draw the
dendrogram.


## Sample No.                     X                       Y

## P1                     0.40                    0.53

## P2                     0.22                    0.38

## P3                     0.35                    0.32

## P4                     0.26                    0.19

## P5                     0.08                    0.41

## P6                     0.45                    0.30

Step 1: Compute the distance matrix

Step 2: Merging the two closest members of the two clusters and finding the minimum element in
distance matrix. Here the minimum value is 0.10 and hence we combine P3 and P6 (as 0.10 came
in the P6 row and P3 column). Now, form clusters of elements corresponding to the minimum value
and update the distance matrix.


min ((P3,P6), P1) = min ((P3,P1), (P6,P1)) = min
(0.22,0.24) = 0.22
min ((P3,P6), P2) = min ((P3,P2), (P6,P2)) = min
(0.14,0.24) = 0.14
min ((P3,P6), P4) = min ((P3,P4), (P6,P4)) = min
(0.13,0.22) = 0.13
min ((P3,P6), P5) = min ((P3,P5), (P6,P5)) = min
(0.28,0.39) = 0.28

Hierarchical Divisive clustering
- It is also known as a top-down approach. This algorithm also does not require to prespecify the
    number of clusters.
- Top-down clustering requires a method for splitting a cluster that contains the whole data and
    proceeds by splitting clusters recursively until individual data have been split into singleton clusters.

Example: Cluster the given data points using divisive clustering (2, 10), (2, 5), (8, 4), (5, 8), (7, 5), (6, 4), (1, 2), (4, 9)
## Answer:

## 1. Step 1: All points in one cluster

Initially, all points are in one cluster.
## 2. Step 2: Split clusters

We split the cluster into two based on some criterion. Let's say we choose to split based on maximizing the distance between
the centroids of the resulting clusters.
## 1. We compute the centroid of all points: Centroid: (4.625, 6.125)

## 2. We compute the distance of each point to the centroid:

           - Distance from (2, 10) to Centroid: √((4.625 - 2)^2 + (6.125 - 10)^2) ≈ 4.66
           - Distance from (2, 5) to Centroid: √((4.625 - 2)^2 + (6.125 - 5)^2) ≈ 1.89
           - Distance from (8, 4) to Centroid: √((4.625 - 8)^2 + (6.125 - 4)^2) ≈ 4.22
           - Distance from (5, 8) to Centroid: √((4.625 - 5)^2 + (6.125 - 8)^2) ≈ 2.06
           - Distance from (7, 5) to Centroid: √((4.625 - 7)^2 + (6.125 - 5)^2) ≈ 3.08
           - Distance from (6, 4) to Centroid: √((4.625 - 6)^2 + (6.125 - 4)^2) ≈ 2.25
           - Distance from (1, 2) to Centroid: √((4.625 - 1)^2 + (6.125 - 2)^2) ≈ 5.87
           - Distance from (4, 9) to Centroid: √((4.625 - 4)^2 + (6.125 - 9)^2) ≈ 4.29
    We split the cluster by separating the point (1, 2) from the rest, as it has the maximum distance from the centroid.

## 3. Step 3: Repeat the splitting

- For Cluster 2:
    - We compute the centroid of Cluster 2: Centroid: (4.857, 6.286)
    - We compute the distance of each point in Cluster 2 to the centroid:
         - Distance from (2, 10) to Centroid: ≈ 4.11
         - Distance from (2, 5) to Centroid: ≈ 1.92
         - Distance from (8, 4) to Centroid: ≈ 4.19
         - Distance from (5, 8) to Centroid: ≈ 2.18
         - Distance from (7, 5) to Centroid: ≈ 2.93
         - Distance from (6, 4) to Centroid: ≈ 2.04
         - Distance from (4, 9) to Centroid: ≈ 3.36
    - Let's say we split Cluster 2 by separating the point (8, 4) from the rest.
- Now, we have three clusters:
    - Cluster 1: {(1, 2)}
    - Cluster 2: {(2, 5), (2, 10), (5, 8), (7, 5), (6, 4), (4, 9)}
    - Cluster 3: {(8, 4)}

Step 4: We need to split cluster 2 further.
- We compute the centroid of Cluster 2: (4.8, 6).
- We compute the distance of each point in Cluster 2 to the centroid:
    - Distance from (2, 5) to Centroid: ≈ 2.5
    - Distance from (5, 8) to Centroid: ≈ 2.5
    - Distance from (7, 5) to Centroid: ≈ 2.55
    - Distance from (6, 4) to Centroid: ≈ 2.81
    - Distance from (4, 9) to Centroid: ≈ 2.41

- We split Cluster 2 by separating the point (6, 4) from the rest.
- The final clusters:
    Cluster 1: {(1, 2)}
    Cluster 2a: {(2, 5), (5, 8), (7, 5), (4, 9)}
    Cluster 2b: {(6, 4)}
    Cluster 3: {(8, 4)}

### Step 5: we need to further split Cluster 2a:

Cluster 2a: {(2, 5), (5, 8), (7, 5), (4, 9)}
1. We compute the centroid of Cluster 2a: (4.5, 6.75).
2. We compute the distance of each point in Cluster 2a to the centroid:
            - Distance from (2, 5) to Centroid: ≈ 2.89
            - Distance from (5, 8) to Centroid: ≈ 1.77
            - Distance from (7, 5) to Centroid: ≈ 2.89
            - Distance from (4, 9) to Centroid: ≈ 1.77
    3. We can see that the points (5, 8) and (4, 9) are closer to each other than to the other points in the cluster. Let's split Cluster 2a by separating
    these two points.
## 4. After the split, we have two new clusters:

            - Cluster 2a1: {(5, 8), (4, 9)}
            - Cluster 2a2: {(2, 5), (7, 5)}
- The final clusters:
- Cluster 1: {(1, 2)}
- Cluster 2a1: {(5, 8), (4, 9)}
- Cluster 2a2: {(2, 5), (7, 5)}
- Cluster 2b: {(6, 4)}
- Cluster 3: {(8, 4)}

## The final clusters:


- Cluster 1: {(1, 2)}
- Cluster 2: {(5, 8)}
- Cluster 3: {(4, 9)}
- Cluster 4: {(2, 5)}
- Cluster 5: {(7, 5)}
- Cluster 6: {(6, 4)}
- Cluster 7: {(8, 4)}

## Density-Based Spatial Clustering Of Applications With Noise (DBSCAN)

- Clusters are dense regions in the data space, separated by regions of the lower density of points.
- The DBSCAN algorithm is based on this intuitive notion of “clusters” and “noise”.
- The key idea is that for each point of a cluster, the neighborhood of a given radius has to contain at
    least a minimum number of points.
    Why DBSCAN?
- Partitioning methods (K-means, PAM clustering) and hierarchical clustering work for finding
    spherical-shaped clusters or convex clusters.
- In other words, they are suitable only for compact and well-separated clusters.
- Moreover, they are also severely affected by the presence of noise and outliers in the data.
- Real-life data may contain irregularities, like:
                      - Clusters can be of arbitrary shape such as those shown in the figure below.
                      - Data may contain noise.

- The figure above shows a data set containing non-
    convex shape clusters and outliers.
- Given such data, the k-means algorithm has
    difficulties in identifying these clusters with
    arbitrary shapes.

Parameters Required For DBSCAN Algorithm
## 1. eps:

- It defines the neighborhood around a data point i.e. if the distance between two points is lower or equal to ‘eps’
    then they are considered neighbors.
- If the eps value is chosen too small then a large part of the data will be considered as an outlier.
- If it is chosen very large then the clusters will merge and the majority of the data points will be in the same
    clusters.


## 2. MinPts:

- Minimum number of neighbors (data points) within eps radius.
- The larger the dataset, the larger value of MinPts must be chosen.
- As a general rule, the minimum MinPts can be derived from the number of dimensions D in the dataset as,
    MinPts >= D+1.
- The minimum value of MinPts must be chosen at least 3.

- In this algorithm, we have 3 types of data points.

Core Point: A point is a core point if it has more than
MinPts points within eps.

Border Point: A point which has fewer than MinPts
within eps but it is in the neighborhood of a core point.

Noise or outlier: A point which is not a core point or
border point.

## DBSCAN ALGORITHM

Step 1: Initialize the algorithm with the dataset and parameters (ε, minPts).


## Step 2: For each point in the dataset:

               - Compute the ε-neighborhood of the point, i.e., all points within a distance ε from the current point.

               - If the number of points in the ε-neighborhood is greater than or equal to minPts:
                   - Mark the point as a core point.
                   - Expand the cluster by recursively adding all reachable points in the ε-neighborhood to the cluster.

               - Otherwise, mark the point as a border point.

Step 3: Continue this process until all points have been visited.


Step 4: Any remaining unvisited points are considered noise points and do not belong to any cluster.

## RObust Clustering using LinKs (ROCK)


- Most clustering algorithms consider only the similarity among points when clustering.
- ROCK displays that distance data cannot lead to high-quality clusters when clustering
    categorical information.
- It is a hierarchical clustering algorithm that analyze the concept of links (the number of
    common neighbours among two objects) for data with categorical attributes.
- ROCK takes a more global method to clustering by considering the neighborhoods of
    single pairs of points.
- If two similar points also have same neighborhoods, thus the two points likely belong to
    the similar cluster and so can be combined.

- Two points, pi and pj, are neighbors if sim(pi, pj) ≥ θ, where sim is a similarity
    function and θ is a user-specified threshold.
- The number of links/connection between pi and pj is represented as the number of
    common neighbors between pi and pj.
- If the number of links between two points is high, then it is more likely that they belong
    to the similar cluster.

- An instance of data including categorical attributes is market basket information.
- Such data includes a database of transactions, where each transaction is a group of
    items.
- Transactions are treated data with Boolean attributes, each corresponding to a single
    item, including bread or cheese.
- In the data for a transaction, the attribute corresponding to an item is True if the
    transaction include the item; otherwise, it is False.
- ROCK’s terms of neighbors and links are the same between two “points” or
    transactions, Ti and Tj, and is represented with the Jaccard coefficient as
