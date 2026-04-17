## Syllabus


- Association Rules: Introduction, Methods to discover association rules, Apriori
    algorithm (Level-wise algorithm), Partition Algorithm, Pincer Search Algorithm,
    Dynamic Itemset Counting Algorithm, FP-tree Growth Algorithm.

### WHAT IS AN ASSOCIATION RULE?

- Let A = {l1, l2,…,lm } be a set of items. Let T, the transaction database, be a set of transactions, where
    each transaction t is a set of items. Thus, t is a subset of A.

### DEFINITION: SUPPORT

- A transaction t is said to support an item li, if li is present in t. t is said to support a subset of items X,
    which is a subset of A, if t supports each item l in X.
- An itemset X has a support s in T, denoted by s(X), if s% of transactions in T support X.
- The support can also be defined as a fractional support, which means the proportion of transactions
    supporting X in T.
- It can also be defined in terms of absolute number of transactions supporting X in T.
- For absolute support, we refer it to as support count.

**EXAMPLE

- Let us consider the following set of transactions in a bookshop.**
- We shall look at a set of only 6 transactions of purchases of books. In the first
    transaction, purchases are made of books on Compiler Construction, Databases, Theory
    of Computations, Computer Graphics and Neural Networks; we shall denote these
    subjects by CC, D, TC, CG and ANN, respectively. Thus, we describe the 6
**transactions as follows:**
- t1:= { ANN, CC, TC, CG}
- t2:= {CC, D, CG}
- t3:= {ANN, CC, TC, CG}
- t4:= {ANN, CC, D, CG}
- t5:= {ANN, CC, D, TC, CG}
- t6:={CC, D, TC}.

- So A:= {ANN, CC, D, TC, CG) and T:= {t1, t2, t3, t4, t5, t6}
- We can see that t2, supports the items CC, D and CG.
- The item D is supported by 4 out of 6 transactions in T.
- Thus, the support of D is 66.6%.

### DEFINITION: ASSOCIATION RULE


- For a given transaction database T, an association rule is an expression of the form X⇒
    Y, where X and Y are subsets of A and X ⇒ Y holds with confidence r, if r% of
    transactions in D that support X also support Y.
- The rule X⇒ Y has support σ in the transaction set T, if σ % of transactions in T support
    XUY.
- The intuitive meaning of such a rule is that a transaction of the database which contains X
    tends to contain Y.
- Given a set of transactions, T, the problem of mining association rules is to discover all
    rules that have support and confidence greater than or equal to the user-specified
    minimum support and minimum confidence, respectively.

**EXAMPLE:**
Consider the example of the bookshop. Assume that σ= 50% and τ=60%. Clearly,
ANN⇒ CC holds. The confidence of this rule is, in fact, 100%, because all the
transactions that support ANN also support CC. On the other hand, CC ⇒ ANN also
holds but its confidence is 66%.

- Each rule has a left-hand side and a right-hand side.
- The left-hand side is also called the antecedent and the right-hand side is also called the consequent.
- In general, both the left-hand side and the right-hand side can contain multiple items, but for
    simplicity we will use single items for now.
- As we have defined above, an association rule has two measures, called confidence and support.
- To see what these terms mean and how they are computed, consider the following example of beer
    and diapers.
- Let T consist of 500,000 transactions; 20,000 transactions of these contain diapers; 30,000 transactions
    contain beer; 10,000 transactions contain both diapers and beer.
- Support (or prevalence) measures how often beer and diapers occur together as a percentage of the
    total transactions, 2% in this case (10,000/500,000).
- Confidence (or predictability) measures how much a particular item is dependent on another. Since
    20,000 transactions contain diapers and 10,000 also contain beer, when people buy diapers, they also
    buy beer 1/2 or 50% of the time.

- The inverse rule has a confidence of 33.333% (computed as 10,000/30,000) and would be stated as
    When people buy beer they also buy diapers 1/3 of the time

- Note that these two rules have the same support. Support does not depend on the direction (or
    implication) of the rule; it is only dependent on the set of items in the rule.
- For this reason, association tools also identify frequently occurring itemsets, whether or not any rules
    are being generated.

**Example: Consider a dataset representing transactions at a grocery store:**

| Transaction ID | Items Purchased |
| --- | --- |
| 1 | Bread, Milk |
| 2 | Bread, Diapers, Beer |
| 3 | Milk, Diapers, Eggs |
| 4 | Bread, Milk, Diapers, Beer |
| 5 | Bread, Milk, Diapers, Eggs |


**Support Calculation:**
Support measures the frequency of occurrence of an itemset in the dataset. It is calculated as the proportion of transactions in the dataset
that contain the itemset.

### 1. Calculate the support for the itemset {Bread, Milk}

Support({Bread, Milk}) = Number of transactions containing {Bread, Milk} / Total number of transactions
= 4 / 5 = 0.8
### 2. Calculate the support for the itemset {Diapers}

Support({Diapers}) = Number of transactions containing {Diapers} / Total number of transactions
= 4 / 5 = 0.8

**Confidence Calculation:**
- Confidence measures the likelihood that an item B is purchased when item A is purchased. It is
    calculated as the proportion of transactions containing both A and B over the proportion of
    transactions containing A.
### 1. Calculate the confidence for the rule {Bread} ➞ {Milk}

## Confidence({Bread} ➞ {Milk}) = Support({Bread, Milk}) / Support({Bread})

= 0.8 / (4 / 5) = 0.8 / 0.8 = 1.0



### 2. Calculate the confidence for the rule {Milk, Diapers} ➞ {Eggs}

Confidence({Milk, Diapers} ➞ {Eggs}) = Support({Milk, Diapers, Eggs}) / Support({Milk,
Diapers})
= (1 / 5) / (3 / 5) = 1 / 3 ≈ 0.333

**Consider a dataset representing transactions at an online bookstore:**
| Transaction ID | Items Purchased |
| --- | --- |
| 1 | Book1, Book2, Book3 |
| 2 | Book1, Book2 |
| 3 | Book1, Book3 |
| 4 | Book2, Book3 |
| 5 | Book1, Book2, Book3 |
| 6 | Book1 |
| 7 | Book2 |

**Support Calculation:**
**Example 1: Calculate the support for the itemset {Book1}.**

Support({Book1}) = Number of transactions containing {Book1} / Total number of
transactions
= 5 / 7 ≈ 0.714

**Example 2: Calculate the support for the itemset {Book2, Book3}.**

Support({Book2, Book3}) = Number of transactions containing {Book2, Book3}
/ Total number of transactions
= 2 / 7 ≈ 0.286

**Confidence Calculation:**
**Example 3: Calculate the confidence for the rule {Book1} ➞ {Book2}.**

## Confidence({Book1} ➞ {Book2}) = Support({Book1, Book2}) /

## Support({Book1})

= (3 / 7) / (5 / 7) = 3 / 5 = 0.6



**Example 4: Calculate the confidence for the rule {Book2} ➞ {Book3}.**

## Confidence({Book2} ➞ {Book3}) = Support({Book2, Book3}) /

## Support({Book2})

= (2 / 7) / (4 / 7) = 2 / 4 = 0.5

### METHODS TO DISCOVER ASSOCIATION RULES


### PROBLEM DECOMPOSITION

- The problem of mining association rules can be decomposed into two subproblems:
    1. Find all sets of items (itemsets) whose support is greater than the user-specified minimum support,
    σ. Such itemsets are called frequent itemsets.
    2. Use the frequent itemsets to generate the desired rules. The general idea is that if, say ABCD and
    AB are frequent itemsets, then we can determine if the rule AB→CD holds by checking the
    following inequality
    𝑠({𝐴, 𝐵, 𝐶, 𝐷})
    ≥ Ƭ
    𝑠({𝐴, 𝐵})
- where s(X) is the support of X in T.

### FREQUENT SET

- Let T be the transaction database and be the user-specified minimum support. An
    itemset X is said to be a frequent itemset in T with respect to σ, if
    s(X) ≥σ
- In Example, if we assume σ= 50%, then {ANN, CC, TC} is a frequent set as it is
    supported by at least 3 out of 6 transactions. You can see that any subset of this set is
    also a frequent set. On the other hand, {ANN, CC, D} is not a frequent itemset and
    hence, no set which properly contains this set is a frequent set.

### MAXIMAL FREQUENT SET

- A frequent set is a maximal frequent set if it is a frequent set and no superset of this is a
    frequent set.

### BORDER SET

- An itemset is a border set if it is not a frequent set, but all its proper subsets are frequent
    sets.

## Apriori Algorithm

- Consider the following dataset and we will find frequent itemsets and generate
    association rules for them.


minimum support count is 2
minimum confidence is 50%

- Step-1: K=1;
    i. Create a table containing support count of each item present in dataset –
    called C1(candidate set)




- **ii. Compare candidate set item’s support count with minimum support count(here**

min_support=2 if support_count of candidate set items is less than min_support then
remove those items). This gives us itemset L1.

## Step-2: K=2

a)   Generate candidate set C2 using L1 (this is called join step). Condition of joining Lk-1 and Lk-1 is that it should
have (K-2) elements in common.
i. Check all subsets of an itemset are frequent or not and if not frequent remove that itemset.(Example
subset of{I1, I2} are {I1}, {I2} they are frequent. Check for each itemset)
- **ii. Now find support count of these itemsets by searching in dataset.**

- **b) compare candidate (C2) support count with minimum support count(here min_support=2 if**

support_count of candidate set item is less than min_support then remove those items) this gives us
itemset L2.

## Step-3:

a) Generate candidate set C3 using L2 (join step). Condition of joining Lk-1 and Lk-1 is that it should have (K-
2) elements in common. So here, for L2, first element should match.
So itemset generated by joining L2 is {I1, I2, I3}{I1, I2, I5}{I1, I3, i5}{I2, I3, I4}{I2, I4, I5}{I2, I3, I5}
i. Check if all subsets of these itemsets are frequent or not and if not, then remove that
itemset.(Here subset of {I1, I2, I3} are {I1, I2},{I2, I3},{I1, I3} which are frequent. For {I2,
I3, I4}, subset {I3, I4} is not frequent so remove it. Similarly check for every itemset)
- **ii. Find support count of these remaining itemset by searching in dataset.**

(II) Compare candidate (C3) support count with minimum support count(here min_support=2 if
support_count of candidate set item is less than min_support then remove those items) this gives us
itemset L3.

## Step-4:

    - Generate candidate set C4 using L3 (join step). Condition of joining Lk-1 and Lk-1 (K=4) is that,
    they should have (K-2) elements in common. So here, for L3, first 2 elements (items) should
    match.
    - Check all subsets of these itemsets are frequent or not (Here itemset formed by joining L3 is {I1,
    I2, I3, I5} so its subset contains {I1, I3, I5}, which is not frequent). So no itemset in C4
    - We stop here because no frequent itemsets are found further.

Therefore the frequent itemsets are: {I1, I2, I3} and {I1, I2, I5}.

- Thus, we have discovered all the frequent item-sets. Now generation of strong association rule comes
    into picture. For that we need to calculate confidence of each rule.
- Consider Itemset {I1, I2, I3}
- So rules can be
              - {I1, I2}=>{I3} //confidence = sup(I1,I2,I3)/sup(I1,I2) = 2/4*100=50%
              - {I1, I3}=>{I2} //confidence = sup(I1,I2,I3)/sup(I1,I3) = 2/4*100=50%
              - {I2, I3}=>{I1} //confidence = sup(I1,I2,I3)/sup(I2,I3) = 2/4*100=50%
              - {I1}=>{I2, I3} //confidence = sup(I1,I2,I3)/sup(I1) = 2/6*100=33%
              - {I2}=>{I1, I3} //confidence = sup(I1,I2,I3)/sup(I2) = 2/7*100=28%
              - {I3}=>{I1,I2} //confidence = sup(I1,I2,I3)/sup(I3) = 2/6*100=33%

- So if minimum confidence is 50%, then first 3 rules can be considered as strong association rules.

- Consider Itemset {I1, I2, I5}
- So rules can be
              - {I1, I2}=>{I5} //confidence = sup(I1,I2,I5)/sup(I1,I2) = 2/4*100=50%
              - {I1, I5}=>{I2} //confidence = sup(I1,I2,I5)/sup(I1,I5) = 2/4*100=50%
              - {I2, I5}=>{I1} //confidence = sup(I1,I2,I5)/sup(I2,I5) = 2/4*100=50%
              - {I1}=>{I2, I5} //confidence = sup(I1,I2,I5)/sup(I1) = 2/6*100=33%
              - {I2}=>{I1, I5} //confidence = sup(I1,I2,I5)/sup(I2) = 2/7*100=28%
              - {I5}=>{I1,I2} //confidence = sup(I1,I2,I5)/sup(I5) = 2/6*100=33%

- So if minimum confidence is 50%, then first 3 rules can be considered as strong association rules.

- Therefore, association rules for the given data are:

            - {I1, I2}=>{I3}
            - {I1, I3}=>{I2}
            - {I2, I3}=>{I1}
            - {I1, I2}=>{I5}
            - {I1, I5}=>{I2}
            - {I2, I5}=>{I1}

## Partition Algorithm

- The partition algorithm is based on the observation that the frequent sets are normally very few in number
    compared to the set of all itemsets.


- The partition algorithm uses two scans of the database to discover all frequent sets.

1.   In one scan, it generates a set of all potentially frequent itemsets by scanning the database once. This set
is a superset of all frequent itemsets, i.e., it may contain false positives; but no false negatives are
reported.

2.   During the second scan, counters for each of these itemsets are set up and their actual support is
measured in one scan of the database.

### PHASE 1

- In the first phase, the partition algorithm logically divides the database into a number of non-overlapping
    partitions.
- The partitions are considered one at a time and all frequent itemsets for that partition are generated.
- Thus, if there are n partitions, Phase I of the algorithm takes n iterations.
- At the end of Phase I, these frequent itemsets are merged to generate a set of all potential frequent itemsets.
- In this step, the local frequent itemsets of same lengths from all n partitions are combined to generate the global
    candidate itemsets.

### PHASE 2

- In Phase II, the actual support for these itemsets are generated and the frequent itemsets are identified.

- The algorithm reads the entire database once during Phase I and once during Phase II.
- The partition sizes are chosen such that each partition can be accommodated in the main memory, so that the
    partitions are read only once in each phase.

- A partition P of the databases refers to any subset of the transactions contained in the database.
- Any two partitions are non-overlapping.
- We define local support for an itemset as the fraction of the transaction containing that particular itemset in a
    partition.
- We define a local frequent itemset as an itemset whose local support in a partition is at least the user-defined
    minimum support.
- A local frequent itemset may or may not be frequent in the context of the entire database.

## Pincer Search Algorithm

- It attempts to find the frequent itemsets in a bottom-up manner but, at the same time, it maintains a list of
    maximal frequent itemsets.
- While making a database pass, it also counts the support of these candidate maximal frequent itemsets to see if
    any one of these is actually frequent.
- In that event, it can conclude that all the subsets of these frequent sets are going to be frequent and, hence, they
    are not verified for the support count in the next pass.
- If we are lucky, we may discover a very large maximal frequent itemset very early in the algorithm.
- If this set subsumes all the candidate sets of level k, then we need not proceed further and thus we save many
    database passes.
- Clearly, the pincer-search has an advantage over a priori algorithm when the largest frequent itemset is long.

- In this algorithm, in each pass, in addition to counting the supports of the candidate in the bottom-up
    direction, it also counts the supports of the itemsets of some itemsets using a top-down approach.
- These are called the Maximal Frequent Candidate Set (MFCS).
- This process helps in pruning the candidate sets very early on in the algorithm.
- If we find a maximal frequent set in this process, then it is recorded in the MFCS.

- Consider a pass k, during which itemsets of size k are to be classified.

- If some itemset that is an element of the MFCS, say X, of cardinality greater than k is
    found to be frequent in this pass, then all its subsets must be frequent.

- Therefore, all of its subsets of cardinality k can be pruned from the set of candidate
    sets considered in the bottom-up direction in the pass.

- They, and their supersets, will never be candidates throughout the rest of the
    execution, potentially improving the performance.

- Similarly, when a new infrequent itemset is found in the bottom-up direction, the
    algorithm will use it to update the MFCS.

- The subsets of the MFCS should not contain this in frequent itemsets.

- The MFCS initially contains a single element, the itemset of cardinality n containing all the elements
    of the database.
- If some m-1 itemsets are infrequent after the first pass (after reading the database once), the MFCS
    will have one element of cardinality n-m.
- Removing the m infrequent items from the initial element of the MFCS, generates this itemset.
- In this case, the top-down search goes down m levels in one pass.
- Unlike the search in the bottom-up direction which goes in one-pass, the top-down search can go
    down many levels in one pass.
- This is because we may discover a maximal frequent set very early in the algorithm.

**EXAMPLE 2**

## Dynamic Itemset Counting Algorithm


- The rationale behind DIC is that it works like a train running over the data, with stops at intervals M
    between transactions.
- When the train reaches the end of the transaction file, it has made one pass over the data, and it starts
    all over again from the beginning for the next pass.
- The passengers on the train are itemsets.
- When an itemset is on the train, we count its occurrence in the transactions that are read.
- When an a priori algorithm is considered in this metaphor, all itemsets get on at the start of a pass and
    get off at the end. The 1-itemsets take the first pass, the 2-itemsets take the second pass, and so on.
- In DIC, there is the added flexibility of allowing itemsets to get on at any stop as long as they get off
    at the same stop the next time the train goes around. Therefore, the itemset has seen all the trans-
    actions in the file.

- Consider for example, if we are mining 40,000 transactions and M =10,000, we will count all the 1-itemsets
    in the first 40,000 transactions we read.
- However, we will begin counting 2-itemsets after the first 10,000 transactions have been read.
- We will begin counting 3-itemsets after 20,000 transactions. For now, let us assume that there are no 4-
    itemsets we need to count.
- Once we get to the end of the file, we will stop counting the 1-itemsets and go back to the start of the file to
    count the 2- and 3-itemsets.
- After the first 10,000 transactions, we will finish counting the 2-itemsets and after 20,000 transaction, we
    will finish counting the 3-itemsets.
- In total, we have made 1.5 passes over the data instead of the 3 passes a level-wise algorithm would make.
- Initially, we identify certain 'stops' in the database.
- It is assumed that we read the records sequentially as we do in other algorithms, but pause to carry out
    certain computations at the 'stop' points.
- For notational convenience, we assign numbers to each stop sequentially.

- We then define four different structures:
                     - Dashed Box
                     - Dashed Circle
                     - Solid Box
                     - Solid Circle

- Each of these structures maintains a list of itemsets.

- Itemsets in the 'dashed' category of structures have a counter and the stop number with them. The counter is to
    keep track of the support value of the corresponding itemset. The stop number is to keep track whether an
    itemset has completed one full pass over a database.

- The itemsets in the 'solid' category structures are not subjected to any counting.

- The itemset in the solid box is the confirmed set of frequent sets.

- The itemsets in the solid circle are the confirmed set of infrequent sets.

- The algorithm counts the support values of the itemsets in the dashed structure as it moves along from
    one stop point to another.

- During the execution of the algorithm, at any stop point, the following events take place:

- Certain itemsets in the dashed circle move into the dashed box. These are the itemsets whose support-
    counts reach value during this iteration (reading records between two consecutive stops).

- Certain itemsets enter afresh into the system and get into the dashed circle. These are essentially the
    supersets of the itemsets that move from the dashed circle to the dashed box.

- The itemsets that have completed one full pass, move from the dashed structure to solid structure.
    That is, if the itemset is in a dashed circle while completing a full pass, it moves to the solid circle. If
    it is in the dashed box, then it moves into solid box after the completing a full pass.
